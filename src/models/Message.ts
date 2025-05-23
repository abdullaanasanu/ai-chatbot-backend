import mongoose from "mongoose";

var MessageSchema = new mongoose.Schema(
  {
    text: { type: String, required: [true, "can't be blank"] },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
  },
  { timestamps: true }
);

mongoose.model("Message", MessageSchema);
