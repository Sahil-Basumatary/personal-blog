import { Resend } from "resend";
import Subscriber from "../models/subscriberModel.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "blog@yourdomain.com";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const BLOG_NAME = process.env.BLOG_NAME || "My Blog";
const RESEND_BATCH_SIZE = 100;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

function buildConfirmUrl(token) {
  return `${CLIENT_ORIGIN}/subscribe/confirm/${token}`;
}
function buildUnsubscribeUrl(token) {
  return `${CLIENT_ORIGIN}/unsubscribe/${token}`;
}
function buildPostUrl(slug) {
  return `${CLIENT_ORIGIN}/posts/${slug}`;
}

function baseTemplate(content, footerHtml = "") {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BLOG_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #e4e4e7;">
              <h1 style="margin:0;font-size:20px;font-weight:600;color:#18181b;">${BLOG_NAME}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#fafafa;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:12px;color:#71717a;line-height:1.6;">
                ${footerHtml}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buttonStyle() {
  return "display:inline-block;padding:12px 24px;background-color:#18181b;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:500;font-size:14px;";
}

export async function sendConfirmationEmail(email, confirmationToken) {
  const confirmUrl = buildConfirmUrl(confirmationToken);
  const subject = `Confirm your subscription to ${BLOG_NAME}`;
  const content = `
    <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Thanks for subscribing! Please confirm your email address by clicking the button below.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;line-height:1.6;">
      This link will expire in 7 days.
    </p>
    <p style="margin:0;">
      <a href="${confirmUrl}" style="${buttonStyle()}">Confirm Subscription</a>
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:#71717a;">
      If the button doesn't work, copy and paste this link:<br>
      <a href="${confirmUrl}" style="color:#3b82f6;word-break:break-all;">${confirmUrl}</a>
    </p>`;
  const footer = `If you didn't subscribe to ${BLOG_NAME}, you can safely ignore this email.`;
  if (!resend) {
    console.log("[EMAIL DEV] Confirmation email:");
    console.log(`  To: ${email}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Confirm URL: ${confirmUrl}`);
    return { success: true, messageId: `dev-${Date.now()}` };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject,
      html: baseTemplate(content, footer),
    });
    if (error) {
      console.error(`[EMAIL] Confirmation failed for ${email}: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error(`[EMAIL] Confirmation exception for ${email}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

export async function sendUnsubscribeConfirmation(email) {
  const subject = `You've been unsubscribed from ${BLOG_NAME}`;
  const content = `
    <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
      You've been successfully unsubscribed from ${BLOG_NAME}. You won't receive any more emails from us.
    </p>
    <p style="margin:0;font-size:15px;color:#3f3f46;line-height:1.6;">
      Changed your mind? You can re-subscribe anytime by visiting our blog.
    </p>
    <p style="margin:24px 0 0;">
      <a href="${CLIENT_ORIGIN}" style="${buttonStyle()}">Visit ${BLOG_NAME}</a>
    </p>`;
  const footer = `Your data will be permanently deleted in 30 days. If you need immediate deletion, visit the unsubscribe page again.`;
  if (!resend) {
    console.log("[EMAIL DEV] Unsubscribe confirmation:");
    console.log(`  To: ${email}`);
    console.log(`  Subject: ${subject}`);
    return { success: true, messageId: `dev-${Date.now()}` };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject,
      html: baseTemplate(content, footer),
    });
    if (error) {
      console.error(`[EMAIL] Unsubscribe confirmation failed for ${email}: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error(`[EMAIL] Unsubscribe confirmation exception for ${email}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

export async function sendNewPostNotification(email, post, unsubscribeToken) {
  const postUrl = buildPostUrl(post.slug);
  const unsubscribeUrl = buildUnsubscribeUrl(unsubscribeToken);
  const subject = `New post: ${post.title}`;
  const excerptText = post.excerpt || "";
  const content = `
    <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">
      New Post
    </p>
    <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#18181b;line-height:1.3;">
      ${post.title}
    </h2>
    ${excerptText ? `<p style="margin:0 0 24px;font-size:15px;color:#3f3f46;line-height:1.6;">${excerptText}</p>` : ""}
    <p style="margin:0;">
      <a href="${postUrl}" style="${buttonStyle()}">Read Post</a>
    </p>`;
  const footer = `You received this because you subscribed to ${BLOG_NAME}.<br><a href="${unsubscribeUrl}" style="color:#71717a;">Unsubscribe</a>`;
  if (!resend) {
    console.log("[EMAIL DEV] New post notification:");
    console.log(`  To: ${email}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Post URL: ${postUrl}`);
    return { success: true, messageId: `dev-${Date.now()}` };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject,
      html: baseTemplate(content, footer),
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
      },
    });
    if (error) {
      console.error(`[EMAIL] New post notification failed for ${email}: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error(`[EMAIL] New post notification exception for ${email}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

export async function sendDeletionConfirmation(email) {
  const subject = `Your data has been deleted from ${BLOG_NAME}`;
  const content = `
    <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
      As requested, your data has been permanently deleted from ${BLOG_NAME}.
    </p>
    <p style="margin:0;font-size:15px;color:#3f3f46;line-height:1.6;">
      This is our final email to you. Take care!
    </p>`;
  const footer = `This is an automated message confirming your GDPR deletion request.`;
  if (!resend) {
    console.log("[EMAIL DEV] Deletion confirmation:");
    console.log(`  To: ${email}`);
    console.log(`  Subject: ${subject}`);
    return { success: true, messageId: `dev-${Date.now()}` };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject,
      html: baseTemplate(content, footer),
    });
    if (error) {
      console.error(`[EMAIL] Deletion confirmation failed for ${email}: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error(`[EMAIL] Deletion confirmation exception for ${email}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

export async function sendBatchNewsletter(post) {
  const subscribers = await Subscriber.find({
    confirmed: true,
    unsubscribedAt: null,
  }).exec();
  if (subscribers.length === 0) {
    console.log("[EMAIL] No subscribers to notify");
    return { sent: 0, failed: 0 };
  }
  console.log(`[EMAIL] Sending newsletter to ${subscribers.length} subscriber(s)`);
  if (!resend) {
    for (const sub of subscribers) {
      console.log(`[EMAIL DEV] Would send to: ${sub.email}`);
    }
    return { sent: subscribers.length, failed: 0 };
  }
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < subscribers.length; i += RESEND_BATCH_SIZE) {
    const batch = subscribers.slice(i, i + RESEND_BATCH_SIZE);
    const emailPromises = batch.map((sub) => {
      const postUrl = buildPostUrl(post.slug);
      const unsubscribeUrl = buildUnsubscribeUrl(sub.unsubscribeToken);
      const excerptText = post.excerpt || "";
      const content = `
        <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">
          New Post
        </p>
        <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#18181b;line-height:1.3;">
          ${post.title}
        </h2>
        ${excerptText ? `<p style="margin:0 0 24px;font-size:15px;color:#3f3f46;line-height:1.6;">${excerptText}</p>` : ""}
        <p style="margin:0;">
          <a href="${postUrl}" style="${buttonStyle()}">Read Post</a>
        </p>`;
      const footer = `You received this because you subscribed to ${BLOG_NAME}.<br><a href="${unsubscribeUrl}" style="color:#71717a;">Unsubscribe</a>`;
      return {
        from: EMAIL_FROM,
        to: sub.email,
        subject: `New post: ${post.title}`,
        html: baseTemplate(content, footer),
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
        },
      };
    });
    try {
      const { data, error } = await resend.batch.send(emailPromises);
      if (error) {
        console.error(`[EMAIL] Batch send error: ${error.message}`);
        failed += batch.length;
      } else {
        sent += data.data.length;
      }
    } catch (err) {
      console.error(`[EMAIL] Batch send exception: ${err.message}`);
      failed += batch.length;
    }
  }
  console.log(`[EMAIL] Newsletter complete: ${sent} sent, ${failed} failed`);
  return { sent, failed };
}
