import mongoose, { Schema, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // cloudinary URL
      required: true,
    },
    duration: {
      type: Number, // seconds
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Title too long"],
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, "Description too long"],
    },
    thumbnail: {
      type: String,
      required: true,
    },
    owner: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// 🔍 Search support
videoSchema.index({ title: "text", description: "text" });

// 👤 Populate helper (optional)
videoSchema.methods.getOwnerDetails = function () {
  return this.populate("owner", "userName avatar");
};
videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema);
