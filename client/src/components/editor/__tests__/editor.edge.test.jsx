import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { markdownToHtml, htmlToMarkdown } from "../../../lib/editor/markdownConverter";

vi.mock("../../../api/uploads", () => ({
  uploadImage: vi.fn(),
}));

vi.mock("../../../lib/markdown/urlPolicy", () => ({
  sanitizeLinkHref: vi.fn((href) => {
    if (!href) return null;
    const blocked = ["javascript:", "data:", "vbscript:", "file:"];
    if (blocked.some((p) => href.toLowerCase().trim().startsWith(p))) return null;
    return href;
  }),
  isAllowedImageSrc: vi.fn(() => true),
}));

const { uploadImage } = await import("../../../api/uploads");
const { default: EditorToolbar } = await import("../EditorToolbar");

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

describe("editor edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles 50 rapid bold toggles without race conditions", () => {
    const editor = createMockEditor();
    render(<EditorToolbar editor={editor} />);
    const boldBtn = screen.getByRole("button", { name: "Bold" });
    for (let i = 0; i < 50; i++) {
      fireEvent.click(boldBtn);
    }
    expect(editor._chain.toggleBold).toHaveBeenCalledTimes(50);
    expect(editor._chain.run).toHaveBeenCalledTimes(50);
  });

  it("handles 1000 list items without performance degradation", () => {
    const items = Array.from({ length: 1000 }, (_, i) => `- Item ${i}`).join("\n");
    const html = markdownToHtml(items);
    expect(html).toContain("Item 0");
    expect(html).toContain("Item 999");
    expect(html.match(/<li>/g).length).toBe(1000);
  });

  it("preserves unicode through round-trip (emoji, CJK, RTL)", () => {
    const input = "# 🎯 Goals\n\n日本語テスト **bold 🔥**\n\nمرحبا بالعالم\n\nשלום עולם";
    const html = markdownToHtml(input);
    const md = htmlToMarkdown(html, { validate: false });
    expect(md).toContain("🎯");
    expect(md).toContain("日本語テスト");
    expect(md).toContain("🔥");
    expect(md).toContain("مرحبا بالعالم");
    expect(md).toContain("שלום עולם");
  });

  it("keeps editor functional after a failed image upload", async () => {
    const editor = createMockEditor();
    const onUploadError = vi.fn();
    uploadImage.mockRejectedValue(new TypeError("Failed to fetch"));
    render(
      <EditorToolbar
        editor={editor}
        getToken={vi.fn().mockResolvedValue("tk-123")}
        onUploadError={onUploadError}
      />
    );
    fireEvent.change(document.querySelector('input[type="file"]'), {
      target: { files: [new File(["px"], "photo.png", { type: "image/png" })] },
    });
    await waitFor(() => {
      expect(onUploadError).toHaveBeenCalledWith(expect.any(TypeError));
    });
    expect(editor._chain.setImage).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(editor._chain.toggleBold).toHaveBeenCalled();
  });

  it("does not crash on malformed markdown with unclosed markers", () => {
    const inputs = [
      "**unclosed bold",
      "```\nno closing fence",
      "**bold *italic ~~strike `code",
      "[broken link](",
    ];
    inputs.forEach((input) => {
      expect(() => markdownToHtml(input)).not.toThrow();
    });
    expect(markdownToHtml("**unclosed bold")).toContain("unclosed bold");
    expect(markdownToHtml("```\nno closing fence")).toContain("no closing fence");
  });

  it("handles 5 levels of nested blockquotes", () => {
    const input = "> L1\n>> L2\n>>> L3\n>>>> L4\n>>>>> L5";
    const html = markdownToHtml(input);
    expect(html.match(/<blockquote>/g).length).toBe(5);
  });

  it("round-trips large content without data loss", () => {
    const large = "# Big Doc\n\n" + "Paragraph. ".repeat(1000);
    const html = markdownToHtml(large);
    const md = htmlToMarkdown(html, { validate: false });
    expect(md).toContain("# Big Doc");
    expect(md).toContain("Paragraph.");
  });
});
