import MarkdownIt from "markdown-it";

const DEV_ALLOWED_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);
const LINK_ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const IMAGE_ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export class MarkdownSanitizationError extends Error {
  /**
   * @param {Array<{kind: "link" | "image", url: string}>} invalidUrls
   */
  constructor(invalidUrls) {
    super("Markdown contains unsafe URLs.");
    this.name = "MarkdownSanitizationError";
    this.invalidUrls = invalidUrls;
  }
}

function safeGetBaseOrigins(explicitBaseOrigins) {
  if (Array.isArray(explicitBaseOrigins) && explicitBaseOrigins.length > 0) {
    return explicitBaseOrigins.filter((o) => typeof o === "string" && o.trim().length > 0);
  }

  const envOrigins = [
    process.env.CLIENT_ORIGIN || "",
    process.env.CLIENT_ORIGIN_PREVIEW || "",
  ].filter(Boolean);

  if (envOrigins.length > 0) return envOrigins;

  return ["http://localhost"];
}

function tryResolveUrl(input, baseOrigin) {
  if (!input || typeof input !== "string") return null;
  try {
    return new URL(input, baseOrigin);
  } catch {
    return null;
  }
}

function sanitizeLinkHref(href, { baseOrigin }) {
  const resolved = tryResolveUrl(href, baseOrigin);
  if (!resolved) return null;
  if (!LINK_ALLOWED_PROTOCOLS.has(resolved.protocol)) return null;
  return href;
}

function getAllowedImageHostnames(baseOrigins) {
  const allowed = new Set();
  for (const origin of baseOrigins) {
    const parsed = tryResolveUrl(origin, origin);
    if (parsed?.hostname) allowed.add(parsed.hostname);
  }
  if (process.env.NODE_ENV !== "production") {
    for (const host of DEV_ALLOWED_HOSTNAMES) allowed.add(host);
  }
  return allowed;
}

function isAllowedImageSrc(src, { baseOrigins }) {
  const baseOrigin = baseOrigins[0];
  const resolved = tryResolveUrl(src, baseOrigin);
  if (!resolved) return false;
  if (!IMAGE_ALLOWED_PROTOCOLS.has(resolved.protocol)) return false;
  return getAllowedImageHostnames(baseOrigins).has(resolved.hostname);
}

function isPotentialAutolink(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;

  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(trimmed)) {
    const base = "http://localhost";
    const resolved = tryResolveUrl(trimmed, base);
    if (resolved && LINK_ALLOWED_PROTOCOLS.has(resolved.protocol)) return true;
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return true;

  return false;
}

function stripHtmlInNonCode(text) {
  let out = "";
  let i = 0;

  while (i < text.length) {
    if (text.startsWith("<!--", i)) {
      const end = text.indexOf("-->", i + 4);
      i = end === -1 ? text.length : end + 3;
      continue;
    }

    const ch = text[i];
    if (ch !== "<") {
      out += ch;
      i += 1;
      continue;
    }

    const close = text.indexOf(">", i + 1);
    if (close === -1) {
      out += "<";
      i += 1;
      continue;
    }

    const inside = text.slice(i + 1, close);
    if (isPotentialAutolink(inside)) {
      out += text.slice(i, close + 1);
      i = close + 1;
      continue;
    }

    const trimmed = inside.trimStart();
    const first = trimmed[0];
    const looksLikeTag = !!first && /[A-Za-z/!?]/.test(first);
    if (!looksLikeTag) {
      out += "<";
      i += 1;
      continue;
    }

    i = close + 1;
  }

  return out;
}

function stripRawHtmlPreservingCode(markdown) {
  const lines = markdown.split("\n");
  let inFence = false;
  let fenceMarker = null;
  let output = [];

  for (const line of lines) {
    const match = line.match(/^( {0,3})(`{3,}|~{3,})(.*)$/);
    if (match) {
      const marker = match[2][0];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (fenceMarker === marker) {
        inFence = false;
        fenceMarker = null;
      }
      output.push(line);
      continue;
    }

    if (inFence) {
      output.push(line);
      continue;
    }

    output.push(stripInlineCodeAware(line));
  }

  return output.join("\n");
}

function stripInlineCodeAware(line) {
  let out = "";
  let i = 0;

  while (i < line.length) {
    if (line[i] !== "`") {
      const nextTick = line.indexOf("`", i);
      const end = nextTick === -1 ? line.length : nextTick;
      out += stripHtmlInNonCode(line.slice(i, end));
      i = end;
      continue;
    }

    const start = i;
    let ticks = 1;
    while (i + ticks < line.length && line[i + ticks] === "`") ticks += 1;
    const marker = "`".repeat(ticks);
    const end = line.indexOf(marker, i + ticks);
    if (end === -1) {
      out += stripHtmlInNonCode(line.slice(start));
      return out;
    }
    out += line.slice(start, end + ticks);
    i = end + ticks;
  }

  return out;
}

function validateMarkdownUrls(markdown, { baseOrigins }) {
  const md = new MarkdownIt({
    html: false,
    linkify: false,
    typographer: false,
  });
  md.validateLink = () => true;

  const tokens = md.parse(markdown, {});
  const invalid = [];

  const stack = [...tokens];
  while (stack.length > 0) {
    const t = stack.pop();
    if (!t) continue;
    if (Array.isArray(t.children) && t.children.length > 0) {
      for (const child of t.children) stack.push(child);
    }

    if (t.type === "link_open") {
      const href = t.attrGet("href");
      if (href && !sanitizeLinkHref(href, { baseOrigin: baseOrigins[0] })) {
        invalid.push({ kind: "link", url: href });
      }
    }

    if (t.type === "image") {
      const src = t.attrGet("src");
      if (src && !isAllowedImageSrc(src, { baseOrigins })) {
        invalid.push({ kind: "image", url: src });
      }
    }
  }

  if (invalid.length > 0) throw new MarkdownSanitizationError(invalid);
}

export function sanitizeMarkdownContent(markdown, { baseOrigins } = {}) {
  const source = typeof markdown === "string" ? markdown : "";
  const resolvedBaseOrigins = safeGetBaseOrigins(baseOrigins);

  const stripped = stripRawHtmlPreservingCode(source);
  validateMarkdownUrls(stripped, { baseOrigins: resolvedBaseOrigins });

  return stripped;
}


