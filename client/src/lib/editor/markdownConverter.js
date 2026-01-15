import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import TurndownService from "turndown";
import { sanitizeLinkHref, isAllowedImageSrc } from "../markdown/urlPolicy";

const markdownToHtmlProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeStringify);

export function markdownToHtml(md) {
  if (md == null || typeof md !== "string") return "";
  if (md.trim() === "") return "";
  const result = markdownToHtmlProcessor.processSync(md);
  return String(result);
}

function createTurndownService() {
  const turndown = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    fence: "```",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "inlined",
  });
  turndown.addRule("strikethrough", {
    filter: ["del", "s", "strike"],
    replacement: (content) => `~~${content}~~`,
  });
  turndown.addRule("listItem", {
    filter: "li",
    replacement: (content, node, options) => {
      content = content.replace(/^\n+/, "").replace(/\n+$/, "\n").replace(/\n/gm, "\n    ");
      let prefix = options.bulletListMarker + " ";
      const parent = node.parentNode;
      if (parent.nodeName === "OL") {
        const start = parent.getAttribute("start");
        const index = Array.prototype.indexOf.call(parent.children, node);
        prefix = (start ? Number(start) + index : index + 1) + ". ";
      }
      return prefix + content.trim() + (node.nextSibling ? "\n" : "");
    },
  });
  return turndown;
}

export function htmlToMarkdown(html, options = {}) {
  if (html == null || typeof html !== "string") return "";
  if (html.trim() === "") return "";
  const turndown = createTurndownService();
  let markdown = turndown.turndown(html);
  const { validate = true, baseOrigin } = options;
  if (validate) {
    const validated = validateAndStripUrls(markdown, { baseOrigin });
    markdown = validated.markdown;
  }
  return markdown;
}

function extractUrlFromMarkdownLink(hrefPart) {
  const trimmed = hrefPart.trim();
  const spaceIndex = trimmed.search(/\s+"/);
  if (spaceIndex !== -1) return trimmed.slice(0, spaceIndex);
  return trimmed;
}

export function validateAndStripUrls(md, options = {}) {
  if (md == null || typeof md !== "string") {
    return { markdown: "", stripped: [] };
  }
  const { baseOrigin } = options;
  const stripped = [];
  let result = md;
  const imageRegex = /!\[([^\]]*)\]\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g;
  result = result.replace(imageRegex, (match, alt, src) => {
    const url = extractUrlFromMarkdownLink(src);
    if (!isAllowedImageSrc(url, { baseOrigin })) {
      stripped.push({ kind: "image", url });
      return "";
    }
    return match;
  });
  const linkRegex = /(?<!!)\[([^\]]*)\]\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g;
  result = result.replace(linkRegex, (match, text, href) => {
    const url = extractUrlFromMarkdownLink(href);
    if (!sanitizeLinkHref(url, { baseOrigin })) {
      stripped.push({ kind: "link", url });
      return text;
    }
    return match;
  });
  result = result.replace(/\n{3,}/g, "\n\n").trim();
  return { markdown: result, stripped };
}
