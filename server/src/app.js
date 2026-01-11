import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { clerkMiddleware } from "@clerk/express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";
import postsRouter from "./routes/posts.js";
import sitemapRouter from "./routes/sitemap.js";
import uploadsRouter from "./routes/uploads.js";
import helmet from "helmet";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = YAML.load(
  path.join(__dirname, "docs", "openapi.yaml")
);

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false, //todo: improve this later :)
  })
);

app.set("trust proxy", 1);

const rawOriginMain = process.env.CLIENT_ORIGIN || "";
const rawOriginPreview = process.env.CLIENT_ORIGIN_PREVIEW || "";
const allowedOrigins = [
  rawOriginMain,
  rawOriginPreview,
];

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173", "http://localhost:5174", "http://localhost:5175");
}

const uniqueAllowedOrigins = [...new Set(
  allowedOrigins
    .map((o) => o.trim())
    .filter(Boolean)
)];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (uniqueAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
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

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/posts", postsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/sitemap.xml", sitemapRouter);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.get("/", (req, res) => {
  res.send("Hello from personal-blog server");
});

export default app;