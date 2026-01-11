import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { uploadLimiter } from "../middleware/rateLimit.js";
import { multerMiddleware, validateMagicBytes } from "../middleware/validateUpload.js";

const router = express.Router();

router.post("/", uploadLimiter, multerMiddleware, validateMagicBytes, uploadImage);

export default router;


