import AppError from "../lib/AppError.js";

const isProd = () => process.env.NODE_ENV === "production";

function normalizeError(err) {
  if (err.isOperational) return err;

  if (err.name === "ValidationError" && err.errors) {
    const msg = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return new AppError(msg, 400);
  }

  if (err.name === "CastError") {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  if (err.type === "entity.parse.failed") {
    return new AppError("Malformed JSON in request body.", 400);
  }

  if (err.message?.startsWith("Not allowed by CORS")) {
    return new AppError("Origin not allowed.", 403);
  }

  return null;
}

// eslint-disable-next-line no-unused-vars
export default function globalErrorHandler(err, req, res, _next) {
  const normalized = normalizeError(err);
  const statusCode = normalized?.statusCode || err.statusCode || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;

  if (!isClientError) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);
  }

  const body = { message: "Something went wrong." };

  if (normalized) {
    body.message = normalized.message;
  } else if (isClientError && err.message) {
    body.message = err.message;
  }

  if (!isProd()) {
    body.stack = err.stack;
    if (!normalized && err.message) {
      body.message = err.message;
    }
  }

  res.status(statusCode).json(body);
}
