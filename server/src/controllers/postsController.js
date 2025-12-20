import Post from "../models/postsModel.js";

const OWNER_USER_ID = process.env.OWNER_USER_ID;

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

    const posts = await Post.find(query).sort({ createdAt: -1 });
    return res.json(posts);
  } catch (err) {
    console.error("getPosts error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.json(post);
  } catch (err) {
    console.error("getPostById error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const authUserId = req.auth?.userId;

    if (!authUserId || authUserId !== OWNER_USER_ID) {
      return res.status(403).json({ message: "Only Sahil can create posts." });
    }

    const {
      title,
      content,
      category,
      isFeatured,
      excerpt = "",
      categoryLabel = "",
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // simple for now, will improve later
    const baseSlug =
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || undefined;

    const post = await Post.create({
      authorId: authUserId,
      title,
      content,
      category: category || "general",
      categoryLabel,
      excerpt,
      slug: baseSlug,
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
    const authUserId = req.auth?.userId;
    console.log("updatePost id:", req.params.id);
    console.log("updatePost authUserId:", authUserId, "OWNER_USER_ID:", OWNER_USER_ID);

    if (!authUserId || authUserId !== OWNER_USER_ID) {
      return res.status(403).json({ message: "Only Sahil can edit posts." });
    }

    const { title, content, category, isFeatured } = req.body;
    console.log("updatePost body:", { title, content, category, isFeatured });

    const post = await Post.findById(req.params.id).exec();
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.authorId) {
      post.authorId = OWNER_USER_ID;
    }

    if (typeof title === "string") post.title = title.trim();
    if (typeof content === "string") post.content = content.trim();
    if (typeof category === "string") post.category = category;
    if (typeof isFeatured === "boolean") post.isFeatured = isFeatured;

    const updated = await post.save();
    return res.json(updated);
  } catch (err) {
    console.error("updatePost error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const authUserId = req.auth?.userId;

    if (!authUserId || authUserId !== OWNER_USER_ID) {
      return res.status(403).json({ message: "Only Sahil can delete posts." });
    }

    const post = await Post.findById(req.params.id);
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
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
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
      return res.status(400).json({ message: "direction must be 'up' or 'down'" });
    }

    const update =
      direction === "up" ? { $inc: { upvotes: 1 } } : { $inc: { downvotes: 1 } };

    const post = await Post.findByIdAndUpdate(req.params.id, update, {
      new: true
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    return res.json(post);
  } catch (err) {
    console.error("votePost error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};
