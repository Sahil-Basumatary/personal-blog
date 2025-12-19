import express from "express";
import { ClerkExpressRequireAuth } from "@clerk/express";
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

// Public routes
router.get("/", getPosts);
router.get("/:id", getPostById);
router.post("/:id/view", incrementViews);

// Protected routes
router.post("/", ClerkExpressRequireAuth(), createPost);
router.put("/:id", ClerkExpressRequireAuth(), updatePost);
router.delete("/:id", ClerkExpressRequireAuth(), deletePost);
router.post("/:id/vote", ClerkExpressRequireAuth(), votePost);

export default router;