import express from "express";
import { generateOgImage } from "../services/ogImage.js";

const router = express.Router();

const MAX_TITLE_LENGTH = 120;
const MAX_CATEGORY_LENGTH = 40;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;

const imageCache = new Map();

function getCacheKey(title, category) {
  return `${title}::${category}`;
}

function getCached(key) {
  const entry = imageCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    imageCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(key, buffer) {
  if (imageCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = imageCache.keys().next().value;
    imageCache.delete(oldest);
  }
  imageCache.set(key, {
    value: buffer,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

router.get("/", async (req, res, next) => {
  try {
    let { title, category } = req.query;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "title query parameter is required" });
    }

    title = title.slice(0, MAX_TITLE_LENGTH).trim();
    category = category
      ? String(category).slice(0, MAX_CATEGORY_LENGTH).trim()
      : "";

    const cacheKey = getCacheKey(title, category);
    const cached = getCached(cacheKey);
    if (cached) {
      res.set("Content-Type", "image/png");
      res.set("Cache-Control", "public, max-age=86400, s-maxage=86400");
      return res.send(cached);
    }

    const png = await generateOgImage(title, category);
    setCached(cacheKey, png);

    res.set("Content-Type", "image/png");
    res.set("Cache-Control", "public, max-age=86400, s-maxage=86400");
    return res.send(png);
  } catch (err) {
    next(err);
  }
});

export default router;
