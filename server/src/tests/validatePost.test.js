import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import express from "express";
import { validateCreatePost } from "../middleware/validatePost.js";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.post("/posts", validateCreatePost, (req, res) => {
    res.json(req.validatedBody);
  });
  return app;
}

describe("validatePost middleware", () => {
  const app = createTestApp();

  it("sanitizes HTML and returns validated body on success", async () => {
    const res = await request(app)
      .post("/posts")
      .send({
        title: "<b>Hello</b>",
        excerpt: "<i>Short</i>",
        categoryLabel: "<span>Tools</span>",
        category: "general",
        content: "Hello <script>alert(1)</script>",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Hello");
    expect(res.body.excerpt).toBe("Short");
    expect(res.body.categoryLabel).toBe("Tools");
    expect(res.body.content).not.toContain("<script>");
    expect(res.body.content).toContain("alert(1)");
  });

  it("returns 400 with zod issues in non-production", async () => {
    const res = await request(app).post("/posts").send({});

    expect(res.statusCode).toBe(400);
    expect(typeof res.body.message).toBe("string");
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.some((e) => e.path === "title")).toBe(true);
    expect(res.body.errors.some((e) => e.path === "content")).toBe(true);
  });

  it("returns 400 for unsafe markdown URLs and includes invalidUrls in non-production", async () => {
    const res = await request(app)
      .post("/posts")
      .send({
        title: "t",
        content: "[x](javascript:alert(1))",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Markdown contains unsafe URLs.");
    expect(Array.isArray(res.body.invalidUrls)).toBe(true);
    expect(res.body.invalidUrls.length).toBeGreaterThan(0);
  });

  it("returns message-only in production", async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const res = await request(app).post("/posts").send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: res.body.message });
    } finally {
      process.env.NODE_ENV = prev;
    }
  });
});


