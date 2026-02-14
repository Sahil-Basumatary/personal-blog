import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockEditor = vi.hoisted(() => ({
  getHTML: vi.fn(() => "<p></p>"),
  setEditable: vi.fn(),
  commands: { setContent: vi.fn() },
}));

const configRef = vi.hoisted(() => ({ current: null }));

vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn((config) => {
    configRef.current = config;
    return mockEditor;
  }),
  EditorContent: ({ className }) => (
    <div data-testid="editor-content" className={className} />
  ),
}));

vi.mock("@tiptap/starter-kit", () => ({ default: { configure: vi.fn(() => "StarterKit") } }));
vi.mock("@tiptap/extension-link", () => ({ default: { configure: vi.fn(() => "Link") } }));
vi.mock("@tiptap/extension-image", () => ({ default: { configure: vi.fn(() => "Image") } }));
vi.mock("@tiptap/extension-placeholder", () => ({ default: { configure: vi.fn(() => "Placeholder") } }));
vi.mock("@tiptap/extension-typography", () => ({ default: "Typography" }));

vi.mock("./EditorToolbar", () => ({
  default: vi.fn(({ disabled }) => (
    <div data-testid="editor-toolbar" data-disabled={String(disabled)} />
  )),
}));

vi.mock("../../lib/editor/markdownConverter", () => ({
  markdownToHtml: vi.fn((md) => `<p>${md || ""}</p>`),
  htmlToMarkdown: vi.fn((html) => (html ? html.replace(/<[^>]*>/g, "") : "")),
}));

import RichTextEditor from "./RichTextEditor";
import { markdownToHtml, htmlToMarkdown } from "../../lib/editor/markdownConverter";

describe("RichTextEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configRef.current = null;
    mockEditor.getHTML.mockReturnValue("<p></p>");
  });

  it("renders with correct extensions and converts initial markdown", () => {
    render(<RichTextEditor initialMarkdown="# Hello" />);
    expect(screen.getByTestId("editor-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
    expect(markdownToHtml).toHaveBeenCalledWith("# Hello");
    expect(configRef.current.extensions).toEqual(
      expect.arrayContaining(["StarterKit", "Typography", "Link", "Image", "Placeholder"])
    );
  });

  it("emits markdown onChange and skips when content is unchanged", () => {
    const onChange = vi.fn();
    render(<RichTextEditor initialMarkdown="same" onChange={onChange} />);
    mockEditor.getHTML.mockReturnValue("<p>same</p>");
    htmlToMarkdown.mockReturnValue("same");
    configRef.current.onUpdate({ editor: mockEditor });
    expect(onChange).not.toHaveBeenCalled();
    htmlToMarkdown.mockReturnValue("new stuff");
    configRef.current.onUpdate({ editor: mockEditor });
    expect(onChange).toHaveBeenCalledWith("new stuff");
  });

  it("applies disabled state to CSS class and editor editable flag", () => {
    const { container } = render(<RichTextEditor disabled />);
    expect(container.firstChild).toHaveClass("disabled");
    expect(mockEditor.setEditable).toHaveBeenCalledWith(false);
  });
});
