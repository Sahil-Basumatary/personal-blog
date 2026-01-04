import { describe, expect, test } from "@jest/globals";
import {
  MarkdownSanitizationError,
  sanitizeMarkdownContent,
} from "../lib/markdownSanitizer.js";

describe("markdownSanitizer", () => {
  test("strips raw HTML tags and comments outside code", () => {
    const input = "Hello <!--x--> <b>world</b> <script>alert(1)</script>";
    const out = sanitizeMarkdownContent(input, { baseOrigins: ["https://example.com"] });
    expect(out).toBe("Hello  world alert(1)");
  });

  test("does not strip HTML inside fenced code blocks", () => {
    const input = "```html\n<div>hi</div>\n<script>alert(1)</script>\n```";
    const out = sanitizeMarkdownContent(input, { baseOrigins: ["https://example.com"] });
    expect(out).toBe(input);
  });

  test("does not strip HTML inside inline code spans", () => {
    const input = "Use `<div>ok</div>` in examples.";
    const out = sanitizeMarkdownContent(input, { baseOrigins: ["https://example.com"] });
    expect(out).toBe(input);
  });

  test("preserves CommonMark autolinks", () => {
    const input = "See <https://example.com/a> and <mailto:test@example.com>.";
    const out = sanitizeMarkdownContent(input, { baseOrigins: ["https://example.com"] });
    expect(out).toBe(input);
  });

  test("rejects dangerous link protocols", () => {
    const input = "[x](javascript:alert(1))";
    expect(() => sanitizeMarkdownContent(input, { baseOrigins: ["https://example.com"] })).toThrow(
      MarkdownSanitizationError
    );
  });

  test("allows relative links and blocks unsafe image hosts", () => {
    const ok = "[internal](/blog/1) [hash](#section)";
    expect(sanitizeMarkdownContent(ok, { baseOrigins: ["https://example.com"] })).toBe(ok);

    const badImg = "![a](https://evil.com/a.png)";
    expect(() =>
      sanitizeMarkdownContent(badImg, { baseOrigins: ["https://example.com"] })
    ).toThrow(MarkdownSanitizationError);
  });

  test("allows same-origin images and ignores link-like text in code fences", () => {
    const okImg = "![a](https://example.com/images/a.png)\n![b](/images/b.png)";
    expect(sanitizeMarkdownContent(okImg, { baseOrigins: ["https://example.com"] })).toBe(okImg);

    const codeWithBadLink = "```\n[x](javascript:alert(1))\n```";
    expect(sanitizeMarkdownContent(codeWithBadLink, { baseOrigins: ["https://example.com"] })).toBe(
      codeWithBadLink
    );
  });
});


