const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const key = fs.readFileSync("private.key");
const cert = fs.readFileSync("certificate.crt");

const credentials = {
  key,
  cert,
};

const Server = require("https").createServer(credentials, app);

const io = require("socket.io")(Server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  return res.status(200).send("App Is Running");
});

io.on("connection", (socket) => {
  //emit for send events
  socket.emit("me", socket.id);

  //on for listen events
  socket.on("callUser", ({ userTocall, signalData, from, name }) => {
    io.to(userTocall).emit("callUser", { userTocall, signalData, from, name });
  });

  socket.on("answerCall", ({ signal, to }) => {
    io.to(to).emit("callAccepted", signal);
  });

  socket.on("chessMove", ({ moveObj, towhom }) => {
    io.to(towhom).emit("chessMove", moveObj);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("CallEnded");
  });

  console.log("new Clint Connected  -  " + socket.id);
});

Server.listen("443", () => {
  console.log("Server Is Running on PORT 443");
});