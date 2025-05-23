import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import "dotenv/config";
import { getBotReply, huggingface } from "./utils/huggingface";
import { getAIResponse } from "./utils/openrouter";

// Create global app object
var app = express();

app.use(cors());
// app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("DB Connected"))
  .catch((err) => {
    console.log("DB Connection Error:", err);
  });

require("./models/User");
require("./models/Chat");
require("./models/Message");

const User = mongoose.model("User");
const Chat = mongoose.model("Chat");
const Message = mongoose.model("Message");

app.use("/api", require("./routes"));

app.get("/", function (req, res) {
  res.status(200).send(
    `
        Chat App API
      `
  );
});

var server: any = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + server.address().port);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    // credentials: true,
  },
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: No token"));
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    let user = await User.findById(decoded?.data?.id);
    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }
    socket.user = user;
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("🔒 Authenticated user:", socket.user);

  socket.on("chat:message", async (data) => {
    console.log("💬 Message received:", data);
    // store in database
    let message = new Message();
    message.chat = data.chatId;
    message.user = socket.user._id;
    message.text = data.message;
    message.sender = "user";
    await message.save();

    // emit chat typing to user who sent the message
    socket.emit("chat:typing", {
      chatId: data.chatId,
      name: "Bot",
    });

    // call ai to get response
    const aiResponse = await getAIResponse(data.message);
    console.log("🤖 AI response:", aiResponse);

    let messageAI = new Message();
    messageAI.chat = data.chatId;
    messageAI.user = socket.user._id;
    messageAI.text = aiResponse;
    messageAI.sender = "ai";

    const messageChat = await messageAI.save();

    // stop typing
    socket.emit("chat:stop-typing", {
      chatId: data.chatId,
      name: "Bot",
    });

    // emit message to sender
    socket.emit("chat:message", {
      chatId: data.chatId,
      message: messageChat,
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });

  //   socket.on("setup", async (groupData) => {
  //     let token = groupData.token;
  //     let decoded = await jwt.verify(token, process.env.JWT_SECRET as string);
  //     if (decoded) {
  //       socket.join(groupData.groupId);

  //     }
  //       // (err, decoded) => {
  //       // if (err) {
  //       //   console.log(err);
  //       //   return;
  //       // }
  //       // socket.join(groupData.groupId);
  //       // check and save user to group participant
  //       // GroupParticipant.findOne({
  //       //   group: groupData.groupId,
  //       //   user: decoded.data.id,
  //       // }).then((groupParticipant) => {
  //       //   if (!groupParticipant) {
  //       //     let groupParticipant = new GroupParticipant();
  //       //     groupParticipant.group = groupData.groupId;
  //       //     groupParticipant.user = decoded.data.id;
  //       //     groupParticipant.socketId = socket.id;
  //       //     groupParticipant.save().then(async function (groupParticipant) {
  //       //       socket.emit("connected");
  //       //       groupParticipant.user = await User.findById(groupParticipant.user);
  //       //       socket
  //       //         .in(groupData.groupId)
  //       //         .emit("member joined", groupParticipant);
  //       //     });
  //       //   } else {
  //       //     groupParticipant.socketId = socket.id;
  //       //     groupParticipant.isActive = true;
  //       //     groupParticipant.save().then(async function (groupParticipant) {
  //       //       socket.emit("connected");
  //       //       groupParticipant.user = await User.findById(groupParticipant.user);
  //       //       socket
  //       //         .in(groupData.groupId)
  //       //         .emit("member joined", groupParticipant);
  //       //     });
  //       //   }
  //       // });
  //     // });
  //   });

  //   //   socket.on("typing", (room) => {
  //   //     socket.in(room).emit("typing");
  //   //   });

  //   //   socket.on("stop typing", (room) => {
  //   //     socket.in(room).emit("stop typing");
  //   //   });

  //   socket.on("new message", (newMessage) => {
  //     console.log(newMessage);
  //     let token = newMessage.token;
  //     jwt.verify(token, process.env.JWT_SECRET as string, async (err, decoded) => {
  //       if (err) {
  //         console.log(err);
  //         return;
  //       }
  //       let user = await User.findById(decoded.data.id);
  //       // var chat = new GroupChat();
  //       // chat.group = newMessage.group;
  //       // chat.user = user;
  //       // chat.message = newMessage.message;
  //       // chat.save().then(function (chat) {
  //       //   GroupChat.findById(chat._id)
  //       //     .populate("user")
  //       //     .then(function (chat) {
  //       //       io.in(newMessage.group).emit("new message", chat);
  //       //     });
  //       // });
  //     });
  //   });

  //   socket.on("disconnect", () => {
  //     // GroupParticipant.findOneAndUpdate(
  //     //   { socketId: socket.id },
  //     //   { isActive: false },
  //     //   { new: true }
  //     // ).then(async (groupParticipant) => {
  //     //   if (groupParticipant) {
  //     //     console.log("member left");
  //     //     console.log(groupParticipant.group);
  //     //     groupParticipant.user = await User.findById(groupParticipant.user);
  //     //     io.in(String(groupParticipant.group)).emit(
  //     //       "member left",
  //     //       groupParticipant
  //     //     );
  //     //     // io.in(groupParticipant.group).emit("member left", groupParticipant);
  //     //   }
  //     // });
  //     console.log("Disconnected from socket.io");
  //   });
});
