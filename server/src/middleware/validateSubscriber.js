import { subscribeSchema } from "../validation/subscriberSchema.js";

function shouldIncludeDetails() {
  return process.env.NODE_ENV !== "production";
}

function formatZodIssues(issues) {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export function validateSubscribe(req, res, next) {
  try {
    const raw = req.body && typeof req.body === "object" ? req.body : {};
    const parsed = subscribeSchema.safeParse(raw);
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
    return next();
  } catch (err) {
    console.error("validateSubscribe middleware error:", err?.message || err);
    return res.status(500).json({ message: "Server error" });
  }
}

