import mongoose, { Types, Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    channel: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
