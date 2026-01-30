import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "../db/index.js";
import Subscriber from "../models/subscriberModel.js";
import { runCleanup } from "../jobs/subscriberCleanup.js";

const mockSendConfirmationEmail = jest.fn().mockResolvedValue({ success: true });
const mockSendUnsubscribeConfirmation = jest.fn().mockResolvedValue({ success: true });
const mockSendDeletionConfirmation = jest.fn().mockResolvedValue({ success: true });

jest.unstable_mockModule("../services/emailService.js", () => ({
  sendConfirmationEmail: mockSendConfirmationEmail,
  sendUnsubscribeConfirmation: mockSendUnsubscribeConfirmation,
  sendDeletionConfirmation: mockSendDeletionConfirmation,
}));

const { default: subscribersRouter } = await import("../routes/subscribers.js");

jest.setTimeout(30000);

function createTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/subscribers", subscribersRouter);
  return app;
}

const app = createTestApp();
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connectDB(uri, { isTest: true });
});

beforeEach(async () => {
  await Subscriber.deleteMany({});
  jest.clearAllMocks();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("subscriber flow", () => {
  it("complete lifecycle: subscribe → confirm → unsubscribe → delete", async () => {
    const res1 = await request(app)
      .post("/api/subscribers")
      .send({ email: "test@example.com" });
    expect(res1.statusCode).toBe(201);

    const subscriber = await Subscriber.findOne({ email: "test@example.com" });
    expect(subscriber.confirmed).toBe(false);
    expect(mockSendConfirmationEmail).toHaveBeenCalled();

    const res2 = await request(app).get(
      `/api/subscribers/confirm/${subscriber.confirmationToken}`
    );
    expect(res2.statusCode).toBe(200);

    const confirmed = await Subscriber.findOne({ email: "test@example.com" });
    expect(confirmed.confirmed).toBe(true);

    const res3 = await request(app).get(
      `/api/subscribers/unsubscribe/${subscriber.unsubscribeToken}`
    );
    expect(res3.statusCode).toBe(200);
    expect(mockSendUnsubscribeConfirmation).toHaveBeenCalled();

    const unsubbed = await Subscriber.findOne({ email: "test@example.com" });
    expect(unsubbed.scheduledDeletionAt).not.toBeNull();

    const res4 = await request(app).delete(
      `/api/subscribers/delete/${subscriber.unsubscribeToken}`
    );
    expect(res4.statusCode).toBe(200);
    expect(mockSendDeletionConfirmation).toHaveBeenCalled();

    const deleted = await Subscriber.findOne({ email: "test@example.com" });
    expect(deleted).toBeNull();
  });

  it("rejects invalid email", async () => {
    const res = await request(app)
      .post("/api/subscribers")
      .send({ email: "not-an-email" });
    expect(res.statusCode).toBe(400);
  });

  it("prevents duplicate confirmed subscriptions", async () => {
    await Subscriber.create({
      email: "existing@example.com",
      unsubscribeToken: Subscriber.generateToken(),
      confirmed: true,
      confirmedAt: new Date(),
    });

    const res = await request(app)
      .post("/api/subscribers")
      .send({ email: "existing@example.com" });
    expect(res.statusCode).toBe(409);
  });

  it("allows re-subscribe after unsubscribe", async () => {
    await Subscriber.create({
      email: "comeback@example.com",
      unsubscribeToken: Subscriber.generateToken(),
      confirmed: true,
      unsubscribedAt: new Date(),
      scheduledDeletionAt: new Date(Date.now() + 30 * 86400000),
    });

    const res = await request(app)
      .post("/api/subscribers")
      .send({ email: "comeback@example.com" });
    expect(res.statusCode).toBe(201);

    const sub = await Subscriber.findOne({ email: "comeback@example.com" });
    expect(sub.unsubscribedAt).toBeNull();
    expect(sub.scheduledDeletionAt).toBeNull();
  });
});

describe("cleanup job", () => {
  it("purges expired and stale unconfirmed subscribers", async () => {
    await Subscriber.create({
      email: "expired@example.com",
      unsubscribeToken: Subscriber.generateToken(),
      confirmed: true,
      scheduledDeletionAt: new Date(Date.now() - 1000),
    });

    await Subscriber.create({
      email: "stale@example.com",
      confirmationToken: Subscriber.generateToken(),
      unsubscribeToken: Subscriber.generateToken(),
      confirmed: false,
      createdAt: new Date(Date.now() - 8 * 86400000),
    });

    await Subscriber.create({
      email: "active@example.com",
      unsubscribeToken: Subscriber.generateToken(),
      confirmed: true,
    });

    const result = await runCleanup();

    expect(result.expired).toBe(1);
    expect(result.unconfirmed).toBe(1);

    expect(await Subscriber.findOne({ email: "expired@example.com" })).toBeNull();
    expect(await Subscriber.findOne({ email: "stale@example.com" })).toBeNull();
    expect(await Subscriber.findOne({ email: "active@example.com" })).not.toBeNull();
  });
});
