import { describe, it, expect } from "vitest";
import { markdownToHtml, htmlToMarkdown, validateAndStripUrls } from "./markdownConverter";

const baseOrigin = "https://example.com";

describe("markdownConverter", () => {
  describe("markdownToHtml", () => {
    it("returns empty string for null/undefined", () => {
      expect(markdownToHtml(null)).toBe("");
      expect(markdownToHtml(undefined)).toBe("");
    });

    it("returns empty string for empty input", () => {
      expect(markdownToHtml("")).toBe("");
      expect(markdownToHtml("   ")).toBe("");
    });

    it("converts headings", () => {
      expect(markdownToHtml("# Heading 1")).toContain("<h1>Heading 1</h1>");
      expect(markdownToHtml("## Heading 2")).toContain("<h2>Heading 2</h2>");
    });

    it("converts bold and italic", () => {
      expect(markdownToHtml("**bold**")).toContain("<strong>bold</strong>");
      expect(markdownToHtml("*italic*")).toContain("<em>italic</em>");
    });

    it("converts strikethrough (GFM)", () => {
      expect(markdownToHtml("~~deleted~~")).toContain("<del>deleted</del>");
    });

    it("converts bullet lists", () => {
      const html = markdownToHtml("- Item 1\n- Item 2");
      expect(html).toContain("<ul>");
      expect(html).toContain("<li>Item 1</li>");
    });

    it("converts numbered lists", () => {
      const html = markdownToHtml("1. First\n2. Second");
      expect(html).toContain("<ol>");
      expect(html).toContain("<li>First</li>");
    });

    it("converts inline code", () => {
      expect(markdownToHtml("`code`")).toContain("<code>code</code>");
    });

    it("converts code blocks", () => {
      const html = markdownToHtml("```js\nconst x = 1;\n```");
      expect(html).toContain("<pre>");
      expect(html).toContain("const x = 1;");
    });

    it("converts blockquotes", () => {
      expect(markdownToHtml("> Quote")).toContain("<blockquote>");
    });

    it("converts links", () => {
      expect(markdownToHtml("[Link](https://example.com)")).toContain('<a href="https://example.com">Link</a>');
    });

    it("converts images", () => {
      expect(markdownToHtml("![Alt](/img.png)")).toContain('<img src="/img.png" alt="Alt">');
    });
  });

  describe("htmlToMarkdown", () => {
    it("returns empty string for null/undefined", () => {
      expect(htmlToMarkdown(null)).toBe("");
      expect(htmlToMarkdown(undefined)).toBe("");
    });

    it("converts headings back", () => {
      expect(htmlToMarkdown("<h1>Title</h1>")).toBe("# Title");
      expect(htmlToMarkdown("<h2>Sub</h2>")).toBe("## Sub");
    });

    it("converts emphasis back", () => {
      expect(htmlToMarkdown("<strong>bold</strong>")).toContain("**bold**");
      expect(htmlToMarkdown("<em>italic</em>")).toContain("*italic*");
    });

    it("converts strikethrough back", () => {
      expect(htmlToMarkdown("<del>deleted</del>")).toContain("~~deleted~~");
    });

    it("converts lists back", () => {
      const md = htmlToMarkdown("<ul><li>A</li><li>B</li></ul>");
      expect(md).toContain("- A");
      expect(md).toContain("- B");
    });

    it("converts code back", () => {
      expect(htmlToMarkdown("<code>x</code>")).toContain("`x`");
      expect(htmlToMarkdown("<pre><code>block</code></pre>")).toContain("```");
    });

    it("converts links back", () => {
      expect(htmlToMarkdown('<a href="https://example.com">Link</a>', { validate: false })).toContain("[Link](https://example.com)");
    });
  });

  describe("validateAndStripUrls", () => {
    it("returns empty for null/undefined", () => {
      expect(validateAndStripUrls(null)).toEqual({ markdown: "", stripped: [] });
      expect(validateAndStripUrls(undefined)).toEqual({ markdown: "", stripped: [] });
    });

    it("allows valid http/https links", () => {
      const result = validateAndStripUrls("[Example](https://google.com)", { baseOrigin });
      expect(result.markdown).toContain("[Example](https://google.com)");
      expect(result.stripped).toHaveLength(0);
    });

    it("allows relative links", () => {
      const result = validateAndStripUrls("[Blog](/blog/post)", { baseOrigin });
      expect(result.markdown).toContain("[Blog](/blog/post)");
      expect(result.stripped).toHaveLength(0);
    });

    it("strips javascript: links", () => {
      const result = validateAndStripUrls("[XSS](javascript:void)", { baseOrigin });
      expect(result.markdown).not.toContain("javascript:");
      expect(result.stripped).toContainEqual({ kind: "link", url: "javascript:void" });
    });

    it("strips data: links", () => {
      const result = validateAndStripUrls("[X](data:text/html,<h1>x</h1>)", { baseOrigin });
      expect(result.markdown).not.toContain("data:");
      expect(result.stripped.length).toBeGreaterThan(0);
    });

    it("allows same-origin images", () => {
      const result = validateAndStripUrls("![Alt](/images/photo.png)", { baseOrigin });
      expect(result.markdown).toContain("![Alt](/images/photo.png)");
      expect(result.stripped).toHaveLength(0);
    });

    it("strips external domain images", () => {
      const result = validateAndStripUrls("![Tracker](https://evil.com/pixel.gif)", { baseOrigin });
      expect(result.markdown).not.toContain("evil.com");
      expect(result.stripped).toContainEqual({ kind: "image", url: "https://evil.com/pixel.gif" });
    });

    it("strips data: URI images", () => {
      const result = validateAndStripUrls("![Img](data:image/png;base64,abc)", { baseOrigin });
      expect(result.markdown).not.toContain("data:");
      expect(result.stripped.length).toBeGreaterThan(0);
    });

    it("preserves link text when stripped", () => {
      const result = validateAndStripUrls("Click [here](javascript:void) now", { baseOrigin });
      expect(result.markdown).toContain("here");
      expect(result.markdown).not.toContain("javascript:");
    });
  });
});
