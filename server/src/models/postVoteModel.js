import mongoose from "mongoose";

const { Schema } = mongoose;
const PostVoteSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    direction: {
      type: String,
      enum: ["up", "down"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

PostVoteSchema.index({ postId: 1, userId: 1 }, { unique: true });
const PostVote = mongoose.model("PostVote", PostVoteSchema);

export default PostVote;