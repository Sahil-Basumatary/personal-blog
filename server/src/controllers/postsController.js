import Post from "../models/postsModel.js";
import mongoose from "mongoose";

function getOwnerId() {
  return (
    process.env.OWNER_USER_ID ||
    process.env.VITE_OWNER_USER_ID || 
    "test-owner-id"
  );
}

function requireSignedInOwner(req, opts = {}) {
  const {
    unauthStatus = 401,
    unauthMessage = "You must be signed in to perform this action.",
    forbiddenStatus = 403,
    forbiddenMessage = "You are not allowed to modify posts.",
    misconfigStatus = 500,
    misconfigMessage = "Server is not configured for write access yet.",
  } = opts;

  const authUserId = req.auth?.userId;
  const ownerId = getOwnerId();
  const isTestEnv = process.env.NODE_ENV === "test";

  console.log("requireSignedInOwner:", {
    authUserId,
    ownerId,
    rawOwner: process.env.OWNER_USER_ID,
    nodeEnv: process.env.NODE_ENV,
  });
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

export const getPosts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limitRaw = parseInt(req.query.limit, 10);
    const limit = Math.min(Math.max(limitRaw || 10, 1), 50); 

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(query),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit) || 1, 1);

    return res.json({
      items,
      total,
      page,
      pageSize: limit,
      totalPages,
    });
  } catch (err) {
    console.error("getPosts error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const key = req.params.id;
    let post = null;

    if (isValidObjectId(key)) {
      post = await Post.findById(key);
    }

    if (!post) {
      post = await Post.findOne({ slug: key });
    }

    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.json(post);
  } catch (err) {
    console.error("getPostById error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

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
    return res.json(post);
  } catch (err) {
    console.error("incrementViews error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const votePost = async (req, res) => {
  try {
    const authUserId = req.auth?.userId;
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
    const update =
      direction === "up"
        ? { $inc: { upvotes: 1 } }
        : { $inc: { downvotes: 1 } };

    let post = null;

    if (isValidObjectId(key)) {
      post = await Post.findByIdAndUpdate(key, update, { new: true });
    }
    if (!post) {
      post = await Post.findOneAndUpdate({ slug: key }, update, { new: true });
    }

    if (!post) return res.status(404).json({ message: "Post not found" });

    return res.json(post);
  } catch (err) {
    console.error("votePost error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};