import { z } from "zod";

const ALLOWED_CATEGORIES = [
  "cs-journey",
  "life-in-london",
  "motivation",
  "tools",
  "general",
];

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 100_000;
const MAX_EXCERPT_LENGTH = 500;
const MAX_CATEGORY_LABEL_LENGTH = 50;

export const createPostSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(1, "Title cannot be empty")
    .max(MAX_TITLE_LENGTH, `Title cannot exceed ${MAX_TITLE_LENGTH} characters`),

  content: z
    .string({ required_error: "Content is required" })
    .min(1, "Content cannot be empty")
    .max(MAX_CONTENT_LENGTH, `Content cannot exceed ${MAX_CONTENT_LENGTH} characters`),

  category: z
    .enum(ALLOWED_CATEGORIES, {
      errorMap: () => ({
        message: `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
      }),
    })
    .optional()
    .default("general"),

  categoryLabel: z
    .string()
    .max(MAX_CATEGORY_LABEL_LENGTH, `Category label cannot exceed ${MAX_CATEGORY_LABEL_LENGTH} characters`)
    .optional()
    .default(""),

  excerpt: z
    .string()
    .max(MAX_EXCERPT_LENGTH, `Excerpt cannot exceed ${MAX_EXCERPT_LENGTH} characters`)
    .optional()
    .default(""),

  isFeatured: z.boolean().optional().default(false),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(MAX_TITLE_LENGTH, `Title cannot exceed ${MAX_TITLE_LENGTH} characters`)
    .optional(),

  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(MAX_CONTENT_LENGTH, `Content cannot exceed ${MAX_CONTENT_LENGTH} characters`)
    .optional(),

  category: z
    .enum(ALLOWED_CATEGORIES, {
      errorMap: () => ({
        message: `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
      }),
    })
    .optional(),

  categoryLabel: z
    .string()
    .max(MAX_CATEGORY_LABEL_LENGTH, `Category label cannot exceed ${MAX_CATEGORY_LABEL_LENGTH} characters`)
    .optional(),

  excerpt: z
    .string()
    .max(MAX_EXCERPT_LENGTH, `Excerpt cannot exceed ${MAX_EXCERPT_LENGTH} characters`)
    .optional(),

  isFeatured: z.boolean().optional(),
});

export { ALLOWED_CATEGORIES };

