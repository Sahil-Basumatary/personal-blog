const DEV_ALLOWED_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

function getCdnHostname() {
  const cdnDomain = import.meta.env?.VITE_CDN_DOMAIN;
  if (!cdnDomain) return null;
  try {
    const url = new URL(`https://${cdnDomain}`);
    return url.hostname;
  } catch {
    return null;
  }
}

function safeGetBaseOrigin(explicitBaseOrigin) {
  if (explicitBaseOrigin) return explicitBaseOrigin;

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "http://localhost";
}

function tryResolveUrl(input, baseOrigin) {
  if (!input || typeof input !== "string") return null;

  try {
    return new URL(input, baseOrigin);
  } catch {
    return null;
  }
}

export function sanitizeLinkHref(href, { baseOrigin } = {}) {
  const resolved = tryResolveUrl(href, safeGetBaseOrigin(baseOrigin));
  if (!resolved) return null;

  const allowedProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);
  if (!allowedProtocols.has(resolved.protocol)) return null;

  return href;
}

export function isAllowedImageSrc(src, { baseOrigin } = {}) {
  const base = safeGetBaseOrigin(baseOrigin);
  const resolved = tryResolveUrl(src, base);
  if (!resolved) return false;

  if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
    return false;
  }

  const baseUrl = tryResolveUrl(base, base);
  const cdnHostname = getCdnHostname();
  const allowedHostnames = new Set([
    ...(baseUrl?.hostname ? [baseUrl.hostname] : []),
    ...(cdnHostname ? [cdnHostname] : []),
    ...DEV_ALLOWED_HOSTNAMES,
  ]);

  return allowedHostnames.has(resolved.hostname);
}

export function isExternalHref(href, { baseOrigin } = {}) {
  const base = safeGetBaseOrigin(baseOrigin);
  const resolved = tryResolveUrl(href, base);
  if (!resolved) return false;

  const baseUrl = tryResolveUrl(base, base);
  if (!baseUrl) return true;

  return resolved.origin !== baseUrl.origin;
}


