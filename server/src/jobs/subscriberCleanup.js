import Subscriber from "../models/subscriberModel.js";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

async function runCleanup() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - SEVEN_DAYS_MS);
  const expiredResult = await Subscriber.deleteMany({
    scheduledDeletionAt: { $lte: now },
  });
  const unconfirmedResult = await Subscriber.deleteMany({
    confirmed: false,
    createdAt: { $lte: sevenDaysAgo },
  });
  if (expiredResult.deletedCount > 0 || unconfirmedResult.deletedCount > 0) {
    console.log(
      `[CLEANUP] Deleted ${expiredResult.deletedCount} expired, ${unconfirmedResult.deletedCount} unconfirmed`
    );
  }
  return {
    expired: expiredResult.deletedCount,
    unconfirmed: unconfirmedResult.deletedCount,
  };
}

export function startSubscriberCleanupJob() {
  runCleanup().catch((err) =>
    console.error("[CLEANUP] Startup error:", err.message)
  );
  setInterval(() => {
    runCleanup().catch((err) =>
      console.error("[CLEANUP] Scheduled error:", err.message)
    );
  }, DAY_MS);
  console.log("[CLEANUP] Subscriber cleanup job scheduled (runs daily)");
}

export { runCleanup };

