import express from "express";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  incrementViews,
  votePost
} from "../controllers/postsController.js";

const router = express.Router();

// List posts, with optional ?search=&category=
router.get("/", getPosts);

router.get("/:id", getPostById);

router.post("/", createPost);

router.put("/:id", updatePost);

router.delete("/:id", deletePost);

router.post("/:id/view", incrementViews);

router.post("/:id/vote", votePost);

export default router;