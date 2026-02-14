import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditorToolbar from "./EditorToolbar";

vi.mock("../../api/uploads", () => ({
  uploadImage: vi.fn(),
}));

vi.mock("../../lib/markdown/urlPolicy", () => ({
  sanitizeLinkHref: vi.fn((href) => {
    if (!href) return null;
    const blocked = ["javascript:", "data:", "vbscript:", "file:"];
    if (blocked.some((p) => href.toLowerCase().trim().startsWith(p))) return null;
    return href;
  }),
}));

const { uploadImage } = await import("../../api/uploads");

function createMockEditor(overrides = {}) {
  const chainObj = {
    focus: vi.fn().mockReturnThis(),
    toggleBold: vi.fn().mockReturnThis(),
    toggleItalic: vi.fn().mockReturnThis(),
    toggleStrike: vi.fn().mockReturnThis(),
    toggleCode: vi.fn().mockReturnThis(),
    toggleBulletList: vi.fn().mockReturnThis(),
    toggleOrderedList: vi.fn().mockReturnThis(),
    toggleBlockquote: vi.fn().mockReturnThis(),
    toggleCodeBlock: vi.fn().mockReturnThis(),
    setHorizontalRule: vi.fn().mockReturnThis(),
    setLink: vi.fn().mockReturnThis(),
    unsetLink: vi.fn().mockReturnThis(),
    extendMarkRange: vi.fn().mockReturnThis(),
    setImage: vi.fn().mockReturnThis(),
    undo: vi.fn().mockReturnThis(),
    redo: vi.fn().mockReturnThis(),
    run: vi.fn(),
  };
  return {
    chain: vi.fn(() => chainObj),
    can: vi.fn(() => ({
      undo: () => overrides.canUndo ?? true,
      redo: () => overrides.canRedo ?? true,
    })),
    isActive: vi.fn((type) => (overrides.activeMarks || []).includes(type)),
    getAttributes: vi.fn(() => overrides.linkAttrs || {}),
    _chain: chainObj,
  };
}

describe("EditorToolbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all buttons and disables them when editor is null", () => {
    render(<EditorToolbar editor={null} />);
    const expected = [
      "Undo", "Redo", "Bold", "Italic", "Strikethrough",
      "Inline Code", "Bullet List", "Numbered List", "Blockquote",
      "Code Block", "Horizontal Rule", "Insert Link", "Insert Image",
    ];
    expected.forEach((label) => {
      const btn = screen.getByRole("button", { name: label });
      expect(btn).toBeInTheDocument();
      expect(btn).toBeDisabled();
    });
  });

  it("calls correct chain commands on formatting clicks", () => {
    const editor = createMockEditor();
    render(<EditorToolbar editor={editor} />);
    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(editor._chain.toggleBold).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Bullet List" }));
    expect(editor._chain.toggleBulletList).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Code Block" }));
    expect(editor._chain.toggleCodeBlock).toHaveBeenCalled();
    expect(editor._chain.run).toHaveBeenCalled();
  });

  it("applies valid link and blocks javascript: URLs", () => {
    const editor = createMockEditor();
    render(<EditorToolbar editor={editor} />);
    fireEvent.click(screen.getByRole("button", { name: "Insert Link" }));
    const input = screen.getByPlaceholderText("https://example.com");
    fireEvent.change(input, { target: { value: "javascript:alert(1)" } });
    fireEvent.click(screen.getByText("Apply"));
    expect(screen.getByText("Invalid or unsafe URL")).toBeInTheDocument();
    expect(editor._chain.setLink).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "https://google.com" } });
    fireEvent.click(screen.getByText("Apply"));
    expect(editor._chain.setLink).toHaveBeenCalledWith({ href: "https://google.com" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("uploads image and inserts into editor", async () => {
    const editor = createMockEditor();
    const getToken = vi.fn().mockResolvedValue("tk-abc");
    uploadImage.mockResolvedValue({ url: "https://cdn.blog.com/photo.png" });
    render(<EditorToolbar editor={editor} getToken={getToken} />);
    const fileInput = document.querySelector('input[type="file"]');
    fireEvent.change(fileInput, {
      target: { files: [new File(["px"], "photo.png", { type: "image/png" })] },
    });
    await waitFor(() => {
      expect(uploadImage).toHaveBeenCalledWith(expect.any(File), "tk-abc");
      expect(editor._chain.setImage).toHaveBeenCalledWith({ src: "https://cdn.blog.com/photo.png" });
    });
  });

  it("calls onUploadError when image upload fails", async () => {
    const editor = createMockEditor();
    const onUploadError = vi.fn();
    uploadImage.mockRejectedValue(new Error("too large"));
    render(
      <EditorToolbar
        editor={editor}
        getToken={vi.fn().mockResolvedValue("tk")}
        onUploadError={onUploadError}
      />
    );
    fireEvent.change(document.querySelector('input[type="file"]'), {
      target: { files: [new File(["x"], "big.jpg", { type: "image/jpeg" })] },
    });
    await waitFor(() => expect(onUploadError).toHaveBeenCalled());
  });
});
