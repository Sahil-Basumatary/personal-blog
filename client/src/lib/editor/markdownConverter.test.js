import { describe, it, expect } from "vitest";
import { markdownToHtml, htmlToMarkdown, validateAndStripUrls } from "./markdownConverter";

const baseOrigin = "https://example.com";

describe("markdownConverter", () => {
  describe("markdownToHtml", () => {
    it("returns empty string for null/undefined/empty", () => {
      expect(markdownToHtml(null)).toBe("");
      expect(markdownToHtml(undefined)).toBe("");
      expect(markdownToHtml("")).toBe("");
    });

    it("converts headings", () => {
      expect(markdownToHtml("# Heading 1")).toContain("<h1>Heading 1</h1>");
      expect(markdownToHtml("## Heading 2")).toContain("<h2>Heading 2</h2>");
    });

    it("converts emphasis", () => {
      expect(markdownToHtml("**bold**")).toContain("<strong>bold</strong>");
      expect(markdownToHtml("*italic*")).toContain("<em>italic</em>");
      expect(markdownToHtml("~~deleted~~")).toContain("<del>deleted</del>");
    });

    it("converts lists", () => {
      expect(markdownToHtml("- Item 1\n- Item 2")).toContain("<ul>");
      expect(markdownToHtml("1. First\n2. Second")).toContain("<ol>");
    });

    it("converts code", () => {
      expect(markdownToHtml("`code`")).toContain("<code>code</code>");
      expect(markdownToHtml("```js\nconst x = 1;\n```")).toContain("<pre>");
    });

    it("converts blockquotes and links", () => {
      expect(markdownToHtml("> Quote")).toContain("<blockquote>");
      expect(markdownToHtml("[Link](https://example.com)")).toContain('<a href="https://example.com">');
    });

    it("converts images", () => {
      expect(markdownToHtml("![Alt](/img.png)")).toContain('<img src="/img.png" alt="Alt">');
    });

    it("converts GFM tables", () => {
      const html = markdownToHtml("| A | B |\n|---|---|\n| 1 | 2 |");
      expect(html).toContain("<table>");
      expect(html).toContain("<th>A</th>");
    });

    it("converts task lists", () => {
      const html = markdownToHtml("- [x] Done\n- [ ] Todo");
      expect(html).toContain('type="checkbox"');
    });
  });

  describe("htmlToMarkdown", () => {
    it("returns empty string for null/undefined/empty", () => {
      expect(htmlToMarkdown(null)).toBe("");
      expect(htmlToMarkdown(undefined)).toBe("");
    });

    it("converts headings back", () => {
      expect(htmlToMarkdown("<h1>Title</h1>")).toBe("# Title");
    });

    it("converts emphasis back", () => {
      expect(htmlToMarkdown("<strong>bold</strong>")).toContain("**bold**");
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

    it("converts tables back", () => {
      const html = "<table><tr><th>X</th></tr><tr><td>a</td></tr></table>";
      const md = htmlToMarkdown(html, { validate: false });
      expect(md).toContain("|");
      expect(md).toContain("X");
    });
  });

  describe("validateAndStripUrls", () => {
    it("allows valid links and relative paths", () => {
      const result = validateAndStripUrls("[Link](https://google.com)\n[Local](/blog)", { baseOrigin });
      expect(result.stripped).toHaveLength(0);
      expect(result.markdown).toContain("https://google.com");
      expect(result.markdown).toContain("/blog");
    });

    it("strips dangerous protocol links", () => {
      const result = validateAndStripUrls("[XSS](javascript:void)\n[Data](data:text/html,x)", { baseOrigin });
      expect(result.markdown).not.toContain("javascript:");
      expect(result.markdown).not.toContain("data:");
      expect(result.stripped.length).toBe(2);
    });

    it("allows same-origin images only", () => {
      const valid = validateAndStripUrls("![Alt](/images/photo.png)", { baseOrigin });
      expect(valid.stripped).toHaveLength(0);
      const invalid = validateAndStripUrls("![Tracker](https://evil.com/pixel.gif)", { baseOrigin });
      expect(invalid.stripped).toContainEqual({ kind: "image", url: "https://evil.com/pixel.gif" });
    });

    it("preserves link text when stripped", () => {
      const result = validateAndStripUrls("Click [here](javascript:void) now", { baseOrigin });
      expect(result.markdown).toContain("here");
      expect(result.markdown).not.toContain("javascript:");
    });

    it("allows mailto links", () => {
      const result = validateAndStripUrls("[Email](mailto:test@example.com)", { baseOrigin });
      expect(result.stripped).toHaveLength(0);
    });
  });

  describe("round-trip conversion", () => {
    it("preserves document structure", () => {
      const original = `# Title

Paragraph with **bold** and *italic*.

- List item 1
- List item 2

> A blockquote

\`\`\`
code block
\`\`\`

[A link](https://example.com)`;
      const result = htmlToMarkdown(markdownToHtml(original), { validate: false });
      expect(result).toContain("# Title");
      expect(result).toContain("**bold**");
      expect(result).toContain("*italic*");
      expect(result).toContain("- List item");
      expect(result).toContain(">");
      expect(result).toContain("```");
      expect(result).toContain("[A link]");
    });
  });

  describe("edge cases", () => {
    it("handles unicode and emojis", () => {
      const html = markdownToHtml("Hello 🚀 世界");
      expect(html).toContain("🚀");
      expect(html).toContain("世界");
    });

    it("handles nested blockquotes", () => {
      const html = markdownToHtml("> L1\n>> L2\n>>> L3");
      expect(html.match(/<blockquote>/g).length).toBe(3);
    });

    it("does not execute raw HTML or scripts", () => {
      expect(markdownToHtml("<script>alert(1)</script>")).not.toContain("<script>");
      expect(markdownToHtml("`<script>bad</script>`")).toContain("<code>");
    });

    it("handles long content without issues", () => {
      const long = "word ".repeat(500);
      expect(markdownToHtml(long)).toContain("word");
    });
  });
});
