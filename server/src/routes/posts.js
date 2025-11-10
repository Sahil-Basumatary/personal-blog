import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    { id: 1, title: "My CS Journey", content: "Learning to code..." },
    { id: 2, title: "Life in London", content: "A coder’s perspective" }
  ]);
});

export default router;