import mongoose from "mongoose";
import crypto from "crypto";

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    confirmationToken: {
      type: String,
      index: true,
      sparse: true,
    },
    unsubscribeToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    confirmed: {
      type: Boolean,
      default: false,
      index: true,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    scheduledDeletionAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

subscriberSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString("hex");
};

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

export default Subscriber;
