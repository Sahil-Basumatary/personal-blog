import { z } from "zod";

const MAX_EMAIL_LENGTH = 254;

export const subscribeSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email cannot be empty")
    .max(MAX_EMAIL_LENGTH, `Email cannot exceed ${MAX_EMAIL_LENGTH} characters`)
    .email("Invalid email address")
    .transform((val) => val.toLowerCase().trim()),
});

