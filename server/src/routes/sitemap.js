import express from "express";
import Post from "../models/postsModel.js";
import { onCacheInvalidate } from "../services/postsCache.js";

const router = express.Router();

const SITEMAP_TTL_MS = 60 * 60 * 1000;
const sitemapCache = new Map();
const CACHE_KEY = "sitemap";

function now() {
  return Date.now();
}

function getCachedSitemap() {
  const entry = sitemapCache.get(CACHE_KEY);
  if (!entry) return null;

  if (entry.expiresAt <= now()) {
    sitemapCache.delete(CACHE_KEY);
    return null;
  }
  return entry.value;
}

function setCachedSitemap(xml) {
  sitemapCache.set(CACHE_KEY, {
    value: xml,
    expiresAt: now() + SITEMAP_TTL_MS,
  });
}

function clearSitemapCache() {
  sitemapCache.clear();
}

onCacheInvalidate(clearSitemapCache);

function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(date) {
  return new Date(date).toISOString().split("T")[0];
}

function generateSitemapXML(posts, baseUrl) {
  const urls = [];

  urls.push({
    loc: baseUrl,
    changefreq: "weekly",
    priority: "1.0",
  });

  urls.push({
    loc: `${baseUrl}/blog`,
    changefreq: "daily",
    priority: "0.8",
  });

  for (const post of posts) {
    const identifier = post.slug || post._id.toString();
    urls.push({
      loc: `${baseUrl}/blog/${escapeXml(identifier)}`,
      lastmod: formatDate(post.updatedAt),
      changefreq: "monthly",
      priority: "0.6",
    });
  }

  const urlEntries = urls
    .map((url) => {
      let entry = `  <url>\n    <loc>${url.loc}</loc>`;
      if (url.lastmod) {
        entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
      }
      entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
      entry += `\n    <priority>${url.priority}</priority>`;
      entry += `\n  </url>`;
      return entry;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

router.get("/", async (req, res, next) => {
  try {
    const cached = getCachedSitemap();
    if (cached) {
      res.set("Content-Type", "application/xml");
      res.set("Cache-Control", "public, max-age=3600");
      return res.send(cached);
    }

    const posts = await Post.find({})
      .select("slug updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    const baseUrl = (process.env.CLIENT_ORIGIN || "").replace(/\/$/, "");
    const xml = generateSitemapXML(posts, baseUrl);

    setCachedSitemap(xml);

    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    return res.send(xml);
  } catch (err) {
    next(err);
  }
});

export default router;

