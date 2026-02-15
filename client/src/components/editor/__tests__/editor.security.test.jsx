import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { markdownToHtml, htmlToMarkdown, validateAndStripUrls } from "../../../lib/editor/markdownConverter";
import { sanitizeLinkHref, isAllowedImageSrc } from "../../../lib/markdown/urlPolicy";

vi.mock("../../../api/uploads", () => ({ uploadImage: vi.fn() }));

const BASE = "https://myblog.com";

describe("editor security", () => {
  it("strips script tags from markdown input", () => {
    const html = markdownToHtml("<script>alert('xss')</script>");
    expect(html).not.toContain("<script>");
  });

  it("strips event handlers like onerror from raw HTML", () => {
    const html = markdownToHtml('<img src="x" onerror="alert(1)">');
    expect(html).not.toContain("onerror");
  });

  it("blocks javascript: protocol in markdown links", () => {
    const result = validateAndStripUrls("[click](javascript:alert(1))", { baseOrigin: BASE });
    expect(result.markdown).not.toContain("javascript:");
    expect(result.stripped.length).toBeGreaterThan(0);
  });

  it("blocks data: and vbscript: protocols in links", () => {
    expect(sanitizeLinkHref("data:text/html,<h1>xss</h1>", { baseOrigin: BASE })).toBeNull();
    expect(sanitizeLinkHref("vbscript:MsgBox(1)", { baseOrigin: BASE })).toBeNull();
  });

  it("blocks external host and data URI images", () => {
    expect(isAllowedImageSrc("https://evil.com/tracker.png", { baseOrigin: BASE })).toBe(false);
    expect(isAllowedImageSrc("data:image/png;base64,iVBOR...", { baseOrigin: BASE })).toBe(false);
  });

  it("allows same-origin images", () => {
    expect(isAllowedImageSrc("https://myblog.com/uploads/photo.jpg", { baseOrigin: BASE })).toBe(true);
    expect(isAllowedImageSrc("/uploads/photo.jpg", { baseOrigin: BASE })).toBe(true);
  });

  it("strips external images from markdown output", () => {
    const result = validateAndStripUrls("![tracker](https://evil.com/pixel.gif)", { baseOrigin: BASE });
    expect(result.markdown).not.toContain("evil.com");
    expect(result.stripped[0].kind).toBe("image");
  });

  it("sanitizes pasted HTML with dangerous tags during conversion", () => {
    const md = htmlToMarkdown(
      '<img src="https://evil.com/x.png" onerror="alert(1)">',
      { validate: true, baseOrigin: BASE }
    );
    expect(md).not.toContain("onerror");
    expect(md).not.toContain("evil.com");
  });

  it("rejects javascript: URL in the link dialog UI", async () => {
    const mockEditor = {
      chain: vi.fn(() => ({
        focus: vi.fn().mockReturnThis(),
        extendMarkRange: vi.fn().mockReturnThis(),
        setLink: vi.fn().mockReturnThis(),
        unsetLink: vi.fn().mockReturnThis(),
        run: vi.fn(),
      })),
      can: vi.fn(() => ({ undo: () => false, redo: () => false })),
      isActive: vi.fn(() => false),
      getAttributes: vi.fn(() => ({})),
    };
    const EditorToolbar = (await import("../EditorToolbar")).default;
    render(<EditorToolbar editor={mockEditor} />);
    fireEvent.click(screen.getByRole("button", { name: "Insert Link" }));
    const input = screen.getByPlaceholderText("https://example.com");
    fireEvent.change(input, { target: { value: "javascript:alert(document.cookie)" } });
    fireEvent.click(screen.getByText("Apply"));
    expect(screen.getByText("Invalid or unsafe URL")).toBeInTheDocument();
  });
});
