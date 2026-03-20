import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  isAllowedImageSrc,
  isExternalHref,
  sanitizeLinkHref,
} from "../../lib/markdown/urlPolicy";
import { slugify } from "../../lib/tableOfContents";
import CodeBlock from "./CodeBlock";

function extractText(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node.props && node.props.children) return extractText(node.props.children);
  return "";
}

export default function MarkdownRenderer({ markdown }) {
  const source = typeof markdown === "string" ? markdown : "";
  const slugCounter = new Map();

  function headingId(children) {
    const text = extractText(children);
    const base = slugify(text);
    if (!base) return undefined;
    const count = slugCounter.get(base) || 0;
    slugCounter.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      skipHtml
      components={{
        h2({ children }) {
          return <h2 id={headingId(children)}>{children}</h2>;
        },
        h3({ children }) {
          return <h3 id={headingId(children)}>{children}</h3>;
        },
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          if (match) {
            return <CodeBlock language={match[1]}>{children}</CodeBlock>;
          }
          return <code className={className} {...props}>{children}</code>;
        },
        pre({ node, children }) {
          const child = Array.isArray(children) ? children[0] : children;
          if (child?.type === CodeBlock) return child;
          const codeNode = node?.children?.find((c) => c.tagName === "code");
          const text = codeNode?.children?.map((c) => c.value ?? "").join("") ?? "";
          if (text) return <CodeBlock>{text}</CodeBlock>;
          return <pre>{children}</pre>;
        },
        a({ node, href, children, ...props }) {
          const safeHref = sanitizeLinkHref(href);
          if (!safeHref) {
            return <span {...props}>{children}</span>;
          }
          const external = isExternalHref(safeHref);
          return (
            <a
              href={safeHref}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              {...props}
            >
              {children}
            </a>
          );
        },
        img({ node, src, alt, ...props }) {
          if (!isAllowedImageSrc(src)) {
            return null;
          }
          return (
            <img
              src={src}
              alt={alt || ""}
              loading="lazy"
              decoding="async"
              {...props}
            />
          );
        },
      }}
    >
      {source}
    </ReactMarkdown>
  );
}
