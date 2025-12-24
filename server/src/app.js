import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { clerkMiddleware } from "@clerk/express";

import postsRouter from "./routes/posts.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

if (process.env.NODE_ENV === "test") {
  app.use((req, _res, next) => {
    const testUserId = req.header("x-test-user-id");
    if (testUserId) {
      req.auth = { userId: testUserId };
    } else {
      req.auth = undefined;
    }
    next();
  });
} else {
  app.use(
    clerkMiddleware({
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
      secretKey: process.env.CLERK_SECRET_KEY,
    })
  );
}

app.use("/api/posts", postsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.send("Hello from personal-blog server");
});

export default app;