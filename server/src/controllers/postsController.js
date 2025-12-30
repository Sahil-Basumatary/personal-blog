import Post from "../models/postsModel.js";
import mongoose from "mongoose";
import {
  getCachedPostsList,
  setCachedPostsList,
  getCachedPost,
  setCachedPost,
  invalidatePostsCache,
} from "../services/postsCache.js";
import PostVote from "../models/postVoteModel.js";

function getOwnerId() {
  return (
    process.env.OWNER_USER_ID ||
    process.env.VITE_OWNER_USER_ID || 
    "test-owner-id"
  );
}

function getAuthUserIdFromReq(req) {
  try {
    if (typeof req.auth === "function") {
      const auth = req.auth();
      return auth?.userId || null;
    }

    if (req.auth && typeof req.auth === "object") {
      return req.auth.userId || null;
    }

    return null;
  } catch (err) {
    console.error("Error accessing req.auth:", err.message);
    return null;
  }
}

function requireSignedInOwner(
  req,
  opts = {}
) {
  const {
    unauthStatus = 401,
    unauthMessage = "You must be signed in to perform this action.",
    forbiddenStatus = 403,
    forbiddenMessage = "You are not allowed to modify posts.",
    misconfigStatus = 500,
    misconfigMessage = "Server is not configured for write access yet.",
  } = opts;

  const authUserId = getAuthUserIdFromReq(req);
  const ownerId = getOwnerId();
  const isTestEnv = process.env.NODE_ENV === "test";
  if (!authUserId) {
    return {
      ok: false,
      status: unauthStatus,
      message: unauthMessage,
    };
  }
  if (!ownerId || (!isTestEnv && ownerId === "test-owner-id")) {
    console.warn(
      "OWNER_USER_ID is not set correctly so denying write operation."
    );
    return {
      ok: false,
      status: misconfigStatus,
      message: misconfigMessage,
    };
  }
  if (authUserId !== ownerId) {
    return {
      ok: false,
      status: forbiddenStatus,
      message: forbiddenMessage,
    };
  }
  return { ok: true, authUserId };
}

function makeBaseSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

export async function getPosts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      20,
      Math.max(1, parseInt(req.query.limit, 10) || 5)
    );

    const category = req.query.category || null;
    const search = req.query.search || null;

    const cacheParams = { page, limit, category, search };
    const cached = getCachedPostsList(cacheParams);

    if (cached) {
      res.set(
        "Cache-Control",
        "public, max-age=30, stale-while-revalidate=30"
      );
      return res.json(cached);
    }

    const query = {};
    if (category) query.category = category;

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ title: regex }, { content: regex }, { excerpt: regex }];
    }

    const [items, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Post.countDocuments(query),
    ]);

    const payload = {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };

    setCachedPostsList(cacheParams, payload);
    res.set(
      "Cache-Control",
      "public, max-age=30, stale-while-revalidate=30"
    );

    return res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function getPostById(req, res, next) {
  try {
    const key = req.params.id; 
    const cached = getCachedPost(key);
    if (cached) {
      res.set(
        "Cache-Control",
        "public, max-age=60, stale-while-revalidate=60"
      );
      return res.json(cached);
    }

    const { id } = req.params;
    let post;

    if (isValidObjectId(id)) {
      post = await Post.findById(id);
    } else {
      post = await Post.findOne({ slug: id });
    }

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    setCachedPost(key, post);
    res.set(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=60"
    );

    return res.json(post);
  } catch (err) {
    next(err);
  }
}

export const createPost = async (req, res) => {
  try {
    const gate = requireSignedInOwner(req, {
      unauthStatus: 403,
      unauthMessage: "Only Sahil can create posts.",
      forbiddenStatus: 403,
      forbiddenMessage: "Only Sahil can create posts.",
    });
    if (!gate.ok) {
      return res.status(gate.status).json({ message: gate.message });
    }
    const authUserId = gate.authUserId;

    const {
      title,
      content,
      category,
      isFeatured,
      excerpt = "",
      categoryLabel = "",
    } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const baseSlug = makeBaseSlug(title);
    let slug = baseSlug || undefined;

    if (slug) {
      let candidate = slug;
      let counter = 2;

      while (await Post.exists({ slug: candidate })) {
        candidate = `${slug}-${counter}`;
        counter += 1;
      }

      slug = candidate;
    }

    const post = await Post.create({
      authorId: authUserId,
      title,
      content,
      category: category || "general",
      categoryLabel,
      excerpt,
      slug,
      isFeatured: !!isFeatured,
    });

    invalidatePostsCache();
    res.set("Cache-Control", "no-store");

    return res.status(201).json(post);
  } catch (err) {
    console.error("createPost error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const gate = requireSignedInOwner(req, {
      unauthStatus: 403,
      unauthMessage: "Only Sahil can edit posts.",
      forbiddenStatus: 403,
      forbiddenMessage: "Only Sahil can edit posts.",
    });
    if (!gate.ok) {
      return res.status(gate.status).json({ message: gate.message });
    }

    const key = req.params.id;
    const { title, content, category, isFeatured } = req.body;

    let post = null;

    if (isValidObjectId(key)) {
      post = await Post.findById(key).exec();
    }
    if (!post) {
      post = await Post.findOne({ slug: key }).exec();
    }

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.authorId) {
      post.authorId = gate.authUserId;
    }

    if (typeof title === "string") post.title = title.trim();
    if (typeof content === "string") post.content = content.trim();
    if (typeof category === "string") post.category = category;
    if (typeof isFeatured === "boolean") post.isFeatured = isFeatured;

    const updated = await post.save();

    invalidatePostsCache();
    res.set("Cache-Control", "no-store");

    return res.json(updated);
  } catch (err) {
    console.error("updatePost error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const gate = requireSignedInOwner(req, {
      unauthStatus: 403,
      unauthMessage: "Only Sahil can delete posts.",
      forbiddenStatus: 403,
      forbiddenMessage: "Only Sahil can delete posts.",
    });
    if (!gate.ok) {
      return res.status(gate.status).json({ message: gate.message });
    }

    const key = req.params.id;
    let post = null;

    if (isValidObjectId(key)) {
      post = await Post.findById(key);
    }
    if (!post) {
      post = await Post.findOne({ slug: key });
    }

    if (!post) return res.status(404).json({ message: "Post not found" });

    await post.deleteOne();
    invalidatePostsCache();
    res.set("Cache-Control", "no-store");

    return res.json({ message: "Post removed" });
  } catch (err) {
    console.error("deletePost error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const incrementViews = async (req, res) => {
  try {
    const key = req.params.id;
    let post = null;

    if (isValidObjectId(key)) {
      post = await Post.findByIdAndUpdate(
        key,
        { $inc: { views: 1 } },
        { new: true }
      );
    }

    if (!post) {
      post = await Post.findOneAndUpdate(
        { slug: key },
        { $inc: { views: 1 } },
        { new: true }
      );
    }

    if (!post) return res.status(404).json({ message: "Post not found" });

    invalidatePostsCache();
    res.set("Cache-Control", "no-store");

    return res.json(post);
  } catch (err) {
    console.error("incrementViews error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const votePost = async (req, res) => {
  try {
    const authUserId = getAuthUserIdFromReq(req);
    if (!authUserId) {
      return res.status(401).json({ message: "Login required to vote." });
    }

    const { direction } = req.body;
    if (!["up", "down"].includes(direction)) {
      return res
        .status(400)
        .json({ message: "direction must be 'up' or 'down'" });
    }

    const key = req.params.id;

    let post = null;
    if (isValidObjectId(key)) {
      post = await Post.findById(key).exec();
    }
    if (!post) {
      post = await Post.findOne({ slug: key }).exec();
    }
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postId = post._id;
    let existing = await PostVote.findOne({ postId, userId: authUserId }).exec();
    let deltaUp = 0;
    let deltaDown = 0;

    if (!existing) {
      if (direction === "up") {
        deltaUp = 1;
      } else {
        deltaDown = 1;
      }

      existing = await PostVote.create({
        postId,
        userId: authUserId,
        direction,
      });
    } else if (existing.direction === direction) {
      if (direction === "up") {
        deltaUp = -1;
      } else {
        deltaDown = -1;
      }

      await existing.deleteOne();
      existing = null;
    } else {
      if (direction === "up") {
        deltaUp = 1;
        deltaDown = -1;
      } else {
        deltaUp = -1;
        deltaDown = 1;
      }

      existing.direction = direction;
      await existing.save();
    }
    const update = {};
    if (deltaUp !== 0) update.upvotes = (update.upvotes || 0) + deltaUp;
    if (deltaDown !== 0) update.downvotes = (update.downvotes || 0) + deltaDown;

    let updatedPost = post;
    if (deltaUp !== 0 || deltaDown !== 0) {
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $inc: update },
        { new: true }
      ).exec();
    }
    invalidatePostsCache();
    res.set("Cache-Control", "no-store");

    return res.json(updatedPost);
  } catch (err) {
    console.error("votePost error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};