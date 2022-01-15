const cors = require("cors");
const express = require("express");
const app = express();
require("dotenv").config();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: `${process.env.CLIENT_URL}`,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});
const { v4: uuidV4 } = require("uuid");

app.use(cors({ origin: `${process.env.CLIENT_URL}`, credentials: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", `${process.env.CLIENT_URL}`);
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const roomId = uuidV4();
// console.log(roomId);

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomid, userId, isSs) => {
    console.log(roomid, userId);
    console.log("room-joined");
    socket.join(roomid);

    socket.to(roomid).emit("user-connected", userId, isSs);

    socket.on("disconnect", () => {
      socket.to(roomid).emit("user-disconnected", userId);
    });
    socket.on("leaveRoom", (userid) => {
      socket.to(roomid).emit("user-disconnected", userid);
    });
    socket.on("ssClose", () => {
      socket.to(roomid).emit("remoteSsClose");
    });
  });
});

app.use(express.json());
app.get("/api/roomid", (req, res) => {
  res.send(roomId);
});
app.post("/api/roomid", (req, res) => {
  res.send(roomId);
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Listening on port ${port}`));
