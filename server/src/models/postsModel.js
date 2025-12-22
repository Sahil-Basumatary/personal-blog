import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "general",
    },

    categoryLabel: {
      type: String,
      default: "",
    },

    excerpt: {
      type: String,
      default: "",
    },

    slug: {
      type: String,
      unique: true,
      sparse: true, 
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },

    upvotes: {
      type: Number,
      default: 0,
    },

    downvotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;