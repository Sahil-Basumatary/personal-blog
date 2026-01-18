const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

function buildConfirmUrl(token) {
  return `${CLIENT_ORIGIN}/subscribe/confirm/${token}`;
}

function buildUnsubscribeUrl(token) {
  return `${CLIENT_ORIGIN}/unsubscribe/${token}`;
}

export async function sendConfirmationEmail(email, confirmationToken) {
  const confirmUrl = buildConfirmUrl(confirmationToken);
  console.log("[EMAIL STUB] Confirmation email:");
  console.log(`  To: ${email}`);
  console.log(`  Subject: Confirm your subscription`);
  console.log(`  Confirm URL: ${confirmUrl}`);
  return { success: true, messageId: `stub-${Date.now()}` };
}

export async function sendUnsubscribeConfirmation(email) {
  console.log("[EMAIL STUB] Unsubscribe confirmation:");
  console.log(`  To: ${email}`);
  console.log(`  Subject: You've been unsubscribed`);
  return { success: true, messageId: `stub-${Date.now()}` };
}

export async function sendNewPostNotification(email, post, unsubscribeToken) {
  const unsubscribeUrl = buildUnsubscribeUrl(unsubscribeToken);
  console.log("[EMAIL STUB] New post notification:");
  console.log(`  To: ${email}`);
  console.log(`  Subject: New post: ${post.title}`);
  console.log(`  Unsubscribe URL: ${unsubscribeUrl}`);
  return { success: true, messageId: `stub-${Date.now()}` };
}

export async function sendDeletionConfirmation(email) {
  console.log("[EMAIL STUB] Deletion confirmation:");
  console.log(`  To: ${email}`);
  console.log(`  Subject: Your data has been deleted`);
  return { success: true, messageId: `stub-${Date.now()}` };
}

