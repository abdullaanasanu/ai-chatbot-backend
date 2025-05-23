import mongoose from "mongoose";

var ChatSchema = new mongoose.Schema(
  {
    subject: { type: String, required: [true, "can't be blank"] },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

mongoose.model("Chat", ChatSchema);
