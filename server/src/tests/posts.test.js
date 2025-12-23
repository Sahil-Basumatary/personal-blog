import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../app.js";
import connectDB from "../db/index.js";
import Post from "../models/postsModel.js";

jest.setTimeout(30000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connectDB(uri, { isTest: true });
});

beforeEach(async () => {
  // tidy posts up for clean run easy for my eyes
  await Post.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("GET /api/health", () => {
  it("returns 200 and status ok", async () => {
    const res = await request(app).get("/api/health");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("GET /api/posts with pagination", () => {
  it("returns paginated posts with metadata", async () => {
    const docs = [];
    for (let i = 1; i <= 12; i++) {
      docs.push({
        authorId: "test-author",
        title: `Post ${i}`,
        content: "Lorem ipsum",
        category: "test",
        categoryLabel: "Test",
        excerpt: `Excerpt ${i}`,
      });
    }
    await Post.insertMany(docs);

    const res = await request(app).get("/api/posts?page=1&limit=5");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(5);

    expect(res.body).toMatchObject({
      page: 1,
      pageSize: 5,
      total: 12,
      totalPages: 3,
    });

    const createdAt = res.body.items.map((p) =>
      new Date(p.createdAt).getTime()
    );
    const sorted = [...createdAt].sort((a, b) => b - a);
    expect(createdAt).toEqual(sorted);
  });
});

describe("GET /api/posts search and category", () => {
  it("filters by category and search term", async () => {
    await Post.insertMany([
      {
        authorId: "test-author",
        title: "Life in London as a CS Student",
        content: "coffee shops",
        category: "life-in-london",
        categoryLabel: "Life in London",
        excerpt: "London life...",
      },
      {
        authorId: "test-author",
        title: "My CS Journey",
        content: "learning to code",
        category: "cs-journey",
        categoryLabel: "My CS Journey",
        excerpt: "DevLog",
      },
    ]);

    const res = await request(app).get(
      "/api/posts?category=life-in-london&search=london"
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].title).toBe(
      "Life in London as a CS Student"
    );
  });
});

describe("GET /api/posts/:id or slug", () => {
  it("returns a single post by ObjectId", async () => {
    const created = await Post.create({
      authorId: "test-author",
      title: "Fetch by ID",
      content: "Body",
      category: "test",
      categoryLabel: "Test",
      excerpt: "Excerpt",
    });

    const res = await request(app).get(`/api/posts/${created._id.toString()}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(created._id.toString());
    expect(res.body.title).toBe("Fetch by ID");
  });

  it("returns a single post by slug when id is not an ObjectId", async () => {
    const created = await Post.create({
      authorId: "test-author",
      title: "Fetch by Slug",
      content: "Body",
      category: "test",
      categoryLabel: "Test",
      excerpt: "Excerpt",
      slug: "fetch-by-slug-test",
    });

    const res = await request(app).get(`/api/posts/${created.slug}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.slug).toBe("fetch-by-slug-test");
    expect(res.body.title).toBe("Fetch by Slug");
  });

  it("returns 404 for a missing post", async () => {
    const res = await request(app).get("/api/posts/this-slug-does-not-exist");
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /api/posts/:id/view", () => {
  it("increments views when using ObjectId", async () => {
    const created = await Post.create({
      authorId: "test-author",
      title: "View by ID",
      content: "Body",
      category: "test",
      categoryLabel: "Test",
      excerpt: "Excerpt",
      views: 0,
    });

    const res1 = await request(app).post(
      `/api/posts/${created._id.toString()}/view`
    );

    expect(res1.statusCode).toBe(200);
    expect(res1.body.views).toBe(1);

    const res2 = await request(app).post(
      `/api/posts/${created._id.toString()}/view`
    );

    expect(res2.statusCode).toBe(200);
    expect(res2.body.views).toBe(2);
  });

  it("increments views when using slug", async () => {
    const created = await Post.create({
      authorId: "test-author",
      title: "View by Slug",
      content: "Body",
      category: "test",
      categoryLabel: "Test",
      excerpt: "Excerpt",
      views: 5,
      slug: "view-by-slug-test",
    });

    const res = await request(app).post(
      `/api/posts/${created.slug}/view`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.views).toBe(6);
  });

  it("returns 404 for unknown id/slug", async () => {
    const res = await request(app).post("/api/posts/unknown-slug/view");
    expect(res.statusCode).toBe(404);
  });
});