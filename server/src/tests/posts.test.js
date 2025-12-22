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
  // tidy posts up for clean run for my eyes
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