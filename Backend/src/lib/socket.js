import { Server } from "socket.io";
import express from "express";
import http from "http";

export const app = express();
export const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // local dev
      "https://chat-app-frontend-hazel-one.vercel.app" // deployed frontend
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
