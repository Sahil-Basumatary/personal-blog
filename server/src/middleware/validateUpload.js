import multer from "multer";
import { fileTypeFromBuffer } from "file-type";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = ["jpeg", "jpg", "png", "gif", "webp"];

function formatAllowedTypes() {
  return "jpeg, png, gif, webp";
}

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("INVALID_MIME_TYPE"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

export function multerMiddleware(req, res, next) {
  const uploadSingle = upload.single("image");

  uploadSingle(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
      });
    }

    if (err.message === "INVALID_MIME_TYPE") {
      return res.status(400).json({
        message: `Invalid file type. Allowed: ${formatAllowedTypes()}`,
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "Unexpected field name. Use 'image' for file upload.",
      });
    }

    console.error("multerMiddleware error:", err?.message || err);
    return res.status(500).json({ message: "File upload failed." });
  });
}

export async function validateMagicBytes(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ message: "No file provided." });
  }

  try {
    const detected = await fileTypeFromBuffer(req.file.buffer);

    if (!detected) {
      return res.status(400).json({
        message: `Invalid file type. Allowed: ${formatAllowedTypes()}`,
      });
    }

    const isAllowed =
      ALLOWED_MIME_TYPES.has(detected.mime) &&
      ALLOWED_EXTENSIONS.includes(detected.ext);

    if (!isAllowed) {
      return res.status(400).json({
        message: `Invalid file type. Allowed: ${formatAllowedTypes()}`,
      });
    }

    req.file.detectedMime = detected.mime;
    req.file.detectedExt = detected.ext;

    return next();
  } catch (err) {
    console.error("validateMagicBytes error:", err?.message || err);
    return res.status(500).json({ message: "File validation failed." });
  }
}

