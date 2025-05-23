import mongoose from "mongoose";
import express from "express";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { userAuth } from "../utils/auth";

const router = express.Router();

// models
const User = mongoose.model("User");
const Chat = mongoose.model("Chat");
const Message = mongoose.model("Message");

// routes
router.post(
  "/create",
  body("subject").exists().withMessage("Subject is required"),
  userAuth,
  async (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array(),
      });
    }
    let newChat = new Chat();
    newChat.subject = req.body.subject;
    newChat.user = req.user._id;

    await newChat.save();

    res.status(200).json({
      message: "Chat created successfully",
      chat: newChat,
    });
  }
);

// get all chats
router.get("/all", userAuth, async (req: any, res: any, next: any) => {
  let chats = await Chat.find({ user: req.user._id })
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  await Promise.all(
    chats.map(async (chat: any) => {
      let lastMessage = await Message.findOne({
        chat: chat._id,
      })
        .sort({ createdAt: -1 })
        .populate("user", "name email")
        .limit(1);
      chat.lastMessage = lastMessage;

      return chat;
    })
  );

  res.status(200).json({
    message: "Chats fetched successfully",
    chats,
  });
});

// get chat by id
router.get("/:id", userAuth, async (req: any, res: any, next: any) => {
  let chat = await Chat.findById(req.params.id).populate("user", "name email");

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  let messages = await Message.find({ chat: chat._id }).populate("user", "name email");

  res.status(200).json({
    message: "Chat fetched successfully",
    chat,
    messages,
  });
});

module.exports = router;
