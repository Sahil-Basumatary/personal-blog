import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import TurndownService from "turndown";

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

export function htmlToMarkdown(html) {
  if (html == null || typeof html !== "string") return "";
  if (html.trim() === "") return "";
  const turndown = createTurndownService();
  return turndown.turndown(html);
}
