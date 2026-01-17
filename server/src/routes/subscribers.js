import express from "express";
import {
  subscribe,
  confirmSubscription,
  unsubscribe,
} from "../controllers/subscribersController.js";
import { subscribeLimiter } from "../middleware/rateLimit.js";
import { validateSubscribe } from "../middleware/validateSubscriber.js";

const router = express.Router();

router.post("/", subscribeLimiter, validateSubscribe, subscribe);
router.get("/confirm/:token", confirmSubscription);
router.get("/unsubscribe/:token", unsubscribe);

export default router;

