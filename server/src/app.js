import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import connectDB from "./db/index.js";
import postsRouter from "./routes/posts.js";

dotenv.config();

const app = express();

// connect to MongoDB once at startup
connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/posts", postsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello from personal-blog server");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});