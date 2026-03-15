import express from "express";
import Post from "../models/postsModel.js";
import { onCacheInvalidate } from "../services/postsCache.js";

const router = express.Router();

const RSS_TTL_MS = 60 * 60 * 1000;
const rssCache = new Map();
const CACHE_KEY = "rss";

function now() {
  return Date.now();
}

function getCachedRss() {
  const entry = rssCache.get(CACHE_KEY);
  if (!entry) return null;
  if (entry.expiresAt <= now()) {
    rssCache.delete(CACHE_KEY);
    return null;
  }
  return entry.value;
}

function setCachedRss(xml) {
  rssCache.set(CACHE_KEY, {
    value: xml,
    expiresAt: now() + RSS_TTL_MS,
  });
}

function clearRssCache() {
  rssCache.clear();
}

onCacheInvalidate(clearRssCache);

function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(date) {
  return new Date(date).toUTCString();
}

function stripMarkdown(md) {
  if (!md) return "";
  return md
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_~`]+/g, "")
    .replace(/>\s+/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function generateRssXml(posts, baseUrl) {
  const lastBuildDate = posts.length > 0
    ? toRfc822(posts[0].createdAt)
    : toRfc822(new Date());

  const items = posts.map((post) => {
    const identifier = post.slug || post._id.toString();
    const link = `${baseUrl}/blog/${escapeXml(identifier)}`;
    const description = post.excerpt
      ? escapeXml(post.excerpt)
      : escapeXml(stripMarkdown(post.content).slice(0, 280));

    let item = `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${toRfc822(post.createdAt)}</pubDate>
      <description>${description}</description>`;

    if (post.categoryLabel || post.category) {
      item += `\n      <category>${escapeXml(post.categoryLabel || post.category)}</category>`;
    }

    item += `\n      <content:encoded><![CDATA[${post.content || ""}]]></content:encoded>`;
    item += `\n    </item>`;
    return item;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sahil Blogs</title>
    <link>${baseUrl}</link>
    <description>Thoughts on software engineering, system design, and the journey from student to industry.</description>
    <language>en-gb</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

router.get("/", async (req, res, next) => {
  try {
    const cached = getCachedRss();
    if (cached) {
      res.set("Content-Type", "application/rss+xml; charset=utf-8");
      res.set("Cache-Control", "public, max-age=3600");
      return res.send(cached);
    }

    const posts = await Post.find({})
      .select("title slug content excerpt category categoryLabel createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const baseUrl = (process.env.CLIENT_ORIGIN || "").replace(/\/$/, "");
    const xml = generateRssXml(posts, baseUrl);

    setCachedRss(xml);

    res.set("Content-Type", "application/rss+xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600");
    return res.send(xml);
  } catch (err) {
    next(err);
  }
});

export default router;
