import sanitizeHtml from "sanitize-html";
import {
  createPostSchema,
  updatePostSchema,
} from "../validation/postSchema.js";
import {
  MarkdownSanitizationError,
  sanitizeMarkdownContent,
} from "../lib/markdownSanitizer.js";

const STRIP_ALL_HTML = { allowedTags: [], allowedAttributes: {} };

function shouldIncludeDetails() {
  return process.env.NODE_ENV !== "production";
}

function stripToPlainText(value) {
  return sanitizeHtml(value, STRIP_ALL_HTML).trim();
}

function formatZodIssues(issues) {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

function makeValidatePostMiddleware(schema) {
  return function validatePost(req, res, next) {
    try {
      const raw =
        req.body && typeof req.body === "object" && !Array.isArray(req.body)
          ? req.body
          : {};

      const candidate = { ...raw };

      if (typeof candidate.content === "string") {
        candidate.content = sanitizeMarkdownContent(candidate.content);
      }

      for (const key of ["title", "excerpt", "categoryLabel"]) {
        if (typeof candidate[key] === "string") {
          candidate[key] = stripToPlainText(candidate[key]);
        }
      }

      if (typeof candidate.category === "string") {
        candidate.category = candidate.category.trim();
      }

      const parsed = schema.safeParse(candidate);
      if (!parsed.success) {
        const issues = parsed.error.issues || [];
        const response = {
          message: issues[0]?.message || "Validation failed.",
        };
        if (shouldIncludeDetails()) {
          response.errors = formatZodIssues(issues);
        }
        return res.status(400).json(response);
      }

      req.validatedBody = parsed.data;
      req.body = parsed.data;
      return next();
    } catch (err) {
      if (err instanceof MarkdownSanitizationError) {
        const response = { message: err.message };
        if (shouldIncludeDetails()) {
          response.invalidUrls = err.invalidUrls;
        }
        return res.status(400).json(response);
      }

      console.error("validatePost middleware error:", err?.message || err);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

export const validateCreatePost = makeValidatePostMiddleware(createPostSchema);
export const validateUpdatePost = makeValidatePostMiddleware(updatePostSchema);


