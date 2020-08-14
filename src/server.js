const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocation } = require("./utilities/messages");
const {
  addUser,
  deleteUser,
  fetchUser,
  fetchUsersInRoom,
} = require("./utilities/users");

const app = express();

const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  // console.log("New Websocket connection");

  socket.on("join", (options, callback) => {
    const { err, user } = addUser({
      id: socket.id,
      ...options,
    });

    if (err) return callback(err);

    socket.join(user.room);

    socket.emit(
      "message",
      generateMessage("Admin", `Welcome ${user.displayName} 🤩`)
    );
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.displayName} has joined 🥳🎉 `)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: fetchUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (msg, callback) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) return callback("Profanity is not allowed🤐");
    const { displayName, room } = fetchUser(socket.id);
    io.to(room).emit("message", generateMessage(displayName, msg));
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    const { displayName, room } = fetchUser(socket.id);
    io.to(room).emit(
      "locationMessage",
      generateLocation(
        displayName,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      ),
      callback()
    );
  });

  socket.on("disconnect", () => {
    const user = deleteUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.displayName} has left! 😥`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: fetchUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Listenining on port: ${port}`);
});
