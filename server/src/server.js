import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";
import { startSubscriberCleanupJob } from "./jobs/subscriberCleanup.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

async function start() {
  await connectDB();
  startSubscriberCleanupJob();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});