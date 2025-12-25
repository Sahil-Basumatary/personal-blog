import express from "express";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  incrementViews,
  votePost,
} from "../controllers/postsController.js";
import { writeLimiter, voteLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPostById);
router.post("/:id/view", incrementViews);
router.post("/", writeLimiter, createPost);
router.put("/:id", writeLimiter, updatePost);
router.delete("/:id", writeLimiter, deletePost);
router.post("/:id/vote", voteLimiter, votePost);

export default router;