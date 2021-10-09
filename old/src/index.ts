import express from "express";
import http from "http";
import { Server } from "socket.io";
import ChatServer from "./chatserver";

const app = express();
app.use(express.static("../client/build"));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const chat = new ChatServer();

io.on("connection", (socket) => chat.init(socket));

server.listen(3001, () => {
  console.log(`Listening on port 3001`);
});