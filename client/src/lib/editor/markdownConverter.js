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

export function htmlToMarkdown(html) {
  if (html == null || typeof html !== "string") return "";
  if (html.trim() === "") return "";
  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });
  return turndown.turndown(html);
}
