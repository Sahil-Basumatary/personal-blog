import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  isAllowedImageSrc,
  isExternalHref,
  sanitizeLinkHref,
} from "../../lib/markdown/urlPolicy";

export default function MarkdownRenderer({ markdown }) {
  const source = typeof markdown === "string" ? markdown : "";

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      skipHtml
      components={{
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


