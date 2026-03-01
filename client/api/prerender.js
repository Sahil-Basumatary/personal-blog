const PRERENDER_SERVICE = "https://service.prerender.io/";
const SITE_URL = "https://blog.sahilbzy.com";

export const config = {
  runtime: "edge",
};

const BOT_AGENTS = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|discord|pinterest|redditbot|applebot|semrushbot|ahrefsbot/i;

export default async function handler(request) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "/";
  const prerenderToken = process.env.PRERENDER_TOKEN;
  if (!prerenderToken) {
    return new Response(null, {
      status: 302,
      headers: { Location: path },
    });
  }
  const ua = request.headers.get("user-agent") || "";
  if (!BOT_AGENTS.test(ua)) {
    return new Response(null, {
      status: 302,
      headers: { Location: path },
    });
  }
  const targetUrl = `${SITE_URL}${path}`;
  try {
    const response = await fetch(`${PRERENDER_SERVICE}${targetUrl}`, {
      headers: {
        "X-Prerender-Token": prerenderToken,
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      return new Response(null, {
        status: 302,
        headers: { Location: path },
      });
    }
    const html = await response.text();
    const prerenderStatus = response.headers.get("x-prerender-status");
    const statusCode = prerenderStatus ? parseInt(prerenderStatus, 10) : 200;
    return new Response(html, {
      status: statusCode,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Prerendered": "1",
      },
    });
  } catch {
    return new Response(null, {
      status: 302,
      headers: { Location: path },
    });
  }
}
