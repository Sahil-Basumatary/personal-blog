import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import postsRouter from "../routes/posts.js";
import connectDB from "../db/index.js";
import Post from "../models/postsModel.js";

const TEST_OWNER_ID = "test-owner-id";

jest.setTimeout(30000);

function createTestApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use((req, _res, next) => {
    const testUserId = req.header("x-test-user-id");
    if (testUserId) {
      req.auth = { userId: testUserId };
    }
    next();
  });

  app.use("/api/posts", postsRouter);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/", (_req, res) => {
    res.send("Hello from personal-blog test server");
  });

  return app;
}

const app = createTestApp();

let mongoServer;

beforeAll(async () => {
  process.env.OWNER_USER_ID = TEST_OWNER_ID;
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

describe("POST /api/posts auth and validation", () => {
  it("rejects unauthenticated create with 403", async () => {
    const res = await request(app)
      .post("/api/posts")
      .send({
        title: "No auth post",
        content: "No auth content",
        category: "test",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Only Sahil can create posts.");
  });

  it("rejects create when user is not owner", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("x-test-user-id", "some-other-user")
      .send({
        title: "Not owner",
        content: "Should be rejected",
        category: "test",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Only Sahil can create posts.");
  });

  it("rejects missing title/content with 400", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("x-test-user-id", TEST_OWNER_ID)
      .send({
        title: "",
        content: "",
        category: "test",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Title and content are required");
  });

  it("creates a post when user is owner and data is valid", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("x-test-user-id", TEST_OWNER_ID)
      .send({
        title: "My New Test Post",
        content: "Some content for my post",
        category: "test",
        categoryLabel: "Test",
        excerpt: "Some content for my post",
        isFeatured: true,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("My New Test Post");
    expect(res.body.authorId).toBe(TEST_OWNER_ID);
    expect(res.body.isFeatured).toBe(true);
    expect(res.body.slug).toBe("my-new-test-post");

    const inDb = await Post.findById(res.body._id);
    expect(inDb).not.toBeNull();
    expect(inDb.title).toBe("My New Test Post");
  });
});

describe("PUT /api/posts/:id (updatePost)", () => {
  it("rejects unauthenticated update with 403", async () => {
    const created = await Post.create({
      authorId: TEST_OWNER_ID,
      title: "Original title",
      content: "Original content",
      category: "test",
      categoryLabel: "Test",
      excerpt: "Original excerpt",
    });

    const res = await request(app)
      .put(`/api/posts/${created._id.toString()}`)
      .send({
        title: "Updated title",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Only Sahil can edit posts.");
  });

  it("rejects non-owner update with 403", async () => {
    const created = await Post.create({
      authorId: TEST_OWNER_ID,
      title: "Original title",
      content: "Original content",
      category: "test",
      categoryLabel: "Test",
      excerpt: "Original excerpt",
    });

    const res = await request(app)
      .put(`/api/posts/${created._id.toString()}`)
      .set("x-test-user-id", "some-other-user")
      .send({
        title: "Updated title",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Only Sahil can edit posts.");
  });

  it("allows owner to update fields and persists changes", async () => {
    const created = await Post.create({
      authorId: TEST_OWNER_ID,
      title: "Original title",
      content: "Original content",
      category: "test",
      categoryLabel: "Test",
      excerpt: "Original excerpt",
      isFeatured: false,
    });

    const res = await request(app)
      .put(`/api/posts/${created._id.toString()}`)
      .set("x-test-user-id", TEST_OWNER_ID)
      .send({
        title: "Updated title",
        content: "Updated content",
        isFeatured: true,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated title");
    expect(res.body.content).toBe("Updated content");
    expect(res.body.isFeatured).toBe(true);

    const inDb = await Post.findById(created._id);
    expect(inDb).not.toBeNull();
    expect(inDb.title).toBe("Updated title");
    expect(inDb.isFeatured).toBe(true);
  });
});

describe("DELETE /api/posts/:id (deletePost)", () => {
  it("rejects unauthenticated delete with 403", async () => {
    const created = await Post.create({
      authorId: TEST_OWNER_ID,
      title: "To be deleted",
      content: "Body",
      category: "test",
      categoryLabel: "Test",
      excerpt: "Excerpt",
    });

    const res = await request(app)
      .delete(`/api/posts/${created._id.toString()}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Only Sahil can delete posts.");
  });

  it("rejects non-owner delete with 403", async () => {
    const created = await Post.create({
      authorId: TEST_OWNER_ID,
      title: "To be deleted",
      content: "Body",
      category: "test",
      categoryLabel: "Test",
      excerpt: "Excerpt",
    });

    const res = await request(app)
      .delete(`/api/posts/${created._id.toString()}`)
      .set("x-test-user-id", "some-other-user");

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Only Sahil can delete posts.");
  });

  it("allows owner to delete and removes the post from DB", async () => {
    const created = await Post.create({
      authorId: TEST_OWNER_ID,
      title: "To be deleted",
      content: "Body",
      category: "test",
      categoryLabel: "Test",
      excerpt: "Excerpt",
    });

    const res = await request(app)
      .delete(`/api/posts/${created._id.toString()}`)
      .set("x-test-user-id", TEST_OWNER_ID);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Post removed");

    const inDb = await Post.findById(created._id);
    expect(inDb).toBeNull();
  });
});

describe("POST /api/posts/:id/vote (votePost)", () => {
  it("requires auth and returns 401 when unauthenticated", async () => {
    const created = await Post.create({
      authorId: TEST_OWNER_ID,
      title: "Vote target",
      content: "Body",
      category: "test",
      categoryLabel: "Test",
      excerpt: "Excerpt",
    });

    const res = await request(app)
      .post(`/api/posts/${created._id.toString()}/vote`)
      .send({ direction: "up" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Login required to vote.");
  });

  it("returns 400 for invalid direction", async () => {
    const created = await Post.create({
      authorId: TEST_OWNER_ID,
      title: "Vote target",
      content: "Body",
      category: "test",
      categoryLabel: "Test",
      excerpt: "Excerpt",
    });

    const res = await request(app)
      .post(`/api/posts/${created._id.toString()}/vote`)
      .set("x-test-user-id", "voter-1")
      .send({ direction: "sideways" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("direction must be 'up' or 'down'");
  });

  it("increments upvotes when direction is 'up'", async () => {
    const created = await Post.create({
      authorId: TEST_OWNER_ID,
      title: "Vote target",
      content: "Body",
      category: "test",
      categoryLabel: "Test",
      excerpt: "Excerpt",
      upvotes: 0,
      downvotes: 0,
    });

    const res = await request(app)
      .post(`/api/posts/${created._id.toString()}/vote`)
      .set("x-test-user-id", "voter-1")
      .send({ direction: "up" });

    expect(res.statusCode).toBe(200);
    expect(res.body.upvotes).toBe(1);
    expect(res.body.downvotes).toBe(0);

    const inDb = await Post.findById(created._id);
    expect(inDb.upvotes).toBe(1);
    expect(inDb.downvotes).toBe(0);
  });

  it("increments downvotes when direction is 'down'", async () => {
    const created = await Post.create({
      authorId: TEST_OWNER_ID,
      title: "Vote target",
      content: "Body",
      category: "test",
      categoryLabel: "Test",
      excerpt: "Excerpt",
      upvotes: 3,
      downvotes: 1,
    });

    const res = await request(app)
      .post(`/api/posts/${created._id.toString()}/vote`)
      .set("x-test-user-id", "voter-2")
      .send({ direction: "down" });

    expect(res.statusCode).toBe(200);
    expect(res.body.upvotes).toBe(3);
    expect(res.body.downvotes).toBe(2);

    const inDb = await Post.findById(created._id);
    expect(inDb.upvotes).toBe(3);
    expect(inDb.downvotes).toBe(2);
  });
});