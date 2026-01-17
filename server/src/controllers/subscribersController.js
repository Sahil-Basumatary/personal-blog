import Subscriber from "../models/subscriberModel.js";
import {
  sendConfirmationEmail,
  sendUnsubscribeConfirmation,
} from "../services/emailService.js";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const TOKEN_HEX_LENGTH = 64;

export async function subscribe(req, res) {
  try {
    const { email } = req.validatedBody;
    let subscriber = await Subscriber.findOne({ email });
    if (subscriber) {
      if (subscriber.confirmed && !subscriber.unsubscribedAt) {
        return res.status(409).json({ message: "Email already subscribed." });
      }
      if (subscriber.unsubscribedAt) {
        subscriber.unsubscribedAt = null;
        subscriber.scheduledDeletionAt = null;
        subscriber.confirmed = false;
        subscriber.confirmedAt = null;
      }
      subscriber.confirmationToken = Subscriber.generateToken();
      await subscriber.save();
    } else {
      subscriber = await Subscriber.create({
        email,
        confirmationToken: Subscriber.generateToken(),
        unsubscribeToken: Subscriber.generateToken(),
      });
    }
    await sendConfirmationEmail(email, subscriber.confirmationToken);
    return res.status(201).json({
      message: "Please check your email to confirm your subscription.",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already subscribed." });
    }
    console.error("subscribe error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function confirmSubscription(req, res) {
  try {
    const { token } = req.params;
    if (!token || token.length !== TOKEN_HEX_LENGTH) {
      return res.status(400).json({ message: "Invalid confirmation token." });
    }
    const subscriber = await Subscriber.findOne({ confirmationToken: token });
    if (!subscriber) {
      return res.status(404).json({ message: "Invalid or expired token." });
    }
    if (subscriber.confirmed) {
      return res.status(200).json({ message: "Already confirmed." });
    }
    subscriber.confirmed = true;
    subscriber.confirmedAt = new Date();
    subscriber.confirmationToken = null;
    await subscriber.save();
    return res.status(200).json({ message: "Subscription confirmed!" });
  } catch (err) {
    console.error("confirmSubscription error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function unsubscribe(req, res) {
  try {
    const { token } = req.params;
    if (!token || token.length !== TOKEN_HEX_LENGTH) {
      return res.status(400).json({ message: "Invalid unsubscribe token." });
    }
    const subscriber = await Subscriber.findOne({ unsubscribeToken: token });
    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found." });
    }
    if (subscriber.unsubscribedAt) {
      return res.status(200).json({ message: "Already unsubscribed." });
    }
    subscriber.unsubscribedAt = new Date();
    subscriber.scheduledDeletionAt = new Date(Date.now() + THIRTY_DAYS_MS);
    await subscriber.save();
    await sendUnsubscribeConfirmation(subscriber.email);
    return res.status(200).json({ message: "You have been unsubscribed." });
  } catch (err) {
    console.error("unsubscribe error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

