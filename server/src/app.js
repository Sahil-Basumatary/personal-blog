import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import postsRouter from "./routes/posts.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/posts", postsRouter);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));