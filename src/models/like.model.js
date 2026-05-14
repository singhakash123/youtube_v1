import mongoose, { Types, Schema } from "mongoose";

const likeSchema = new Schema(
  {
    comment: {
      type: Types.ObjectId,
      ref: "Comment",
    },
    video: {
      type: Types.ObjectId,
      ref: "Video",
    },
    likedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Like = mongoose.model("Like", likeSchema);

