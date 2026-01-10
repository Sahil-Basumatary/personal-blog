const isTestEnv = process.env.NODE_ENV === "test";
const LIST_TTL_MS = 30 * 1000;
const ITEM_TTL_MS = 60 * 1000;
const listCache = new Map();
const itemCache = new Map();
const invalidationCallbacks = [];

function now() {
  return Date.now();
}

function getEntry(map, key) {
  const entry = map.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= now()) {
    map.delete(key);
    return null;
  }
  return entry.value;
}

function makeListKey({ page, limit, category, search }) {
  return JSON.stringify({
    page,
    limit,
    category: category || null,
    search: search || null,
  });
}

export function getCachedPostsList(params) {
  if (isTestEnv) return null;
  const key = makeListKey(params);
  return getEntry(listCache, key);
}

export function setCachedPostsList(params, payload) {
  if (isTestEnv) return;
  const key = makeListKey(params);
  listCache.set(key, {
    value: payload,
    expiresAt: now() + LIST_TTL_MS,
  });
}

export function getCachedPost(idOrSlug) {
  if (isTestEnv) return null;
  return getEntry(itemCache, String(idOrSlug));
}

export function setCachedPost(idOrSlug, post) {
  if (isTestEnv) return;
  itemCache.set(String(idOrSlug), {
    value: post,
    expiresAt: now() + ITEM_TTL_MS,
  });
}

export function invalidatePostsCache() {
  listCache.clear();
  itemCache.clear();
  for (const callback of invalidationCallbacks) {
    callback();
  }
}

export function onCacheInvalidate(callback) {
  if (typeof callback === "function") {
    invalidationCallbacks.push(callback);
  }
}