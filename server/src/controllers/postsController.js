import Post from "../models/postsModel.js";

// GET /api/posts
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

// GET /api/posts/:id
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

// POST /api/posts
export const createPost = async (req, res) => {
  try {
    const { title, content, category, isFeatured } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const post = await Post.create({
      title,
      content,
      category,
      isFeatured: !!isFeatured
    });

    return res.status(201).json(post);
  } catch (err) {
    console.error("createPost error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/posts/:id
export const updatePost = async (req, res) => {
  try {
    const { title, content, category, isFeatured } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (category !== undefined) post.category = category;
    if (typeof isFeatured === "boolean") post.isFeatured = isFeatured;

    const updated = await post.save();
    return res.json(updated);
  } catch (err) {
    console.error("updatePost error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/posts/:id
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    await post.deleteOne();
    return res.json({ message: "Post removed" });
  } catch (err) {
    console.error("deletePost error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/posts/:id/view
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

// POST /api/posts/:id/vote
export const votePost = async (req, res) => {
  try {
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