import { describe, it, expect } from "vitest";
import { markdownToHtml, htmlToMarkdown } from "./markdownConverter";

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
  });
});
