import { Server, type Socket } from "socket.io";
import { ROOM_MAX_USERS } from "./constants";
import {
  getRoom,
  joinOrCreateRoom,
  leaveRoom,
  validateJoinRoom,
  validateKick
} from "./controllers/rooms";
import { rooms } from "./objects/Room";
import { User, users } from "./objects/User";
import type { Callback, GetRoomsData, SocketKickData } from "./types/types";
import type { SocketJoinRoomData } from "client-types";

export function registerClientHandlers(io: Server, socket: Socket) {
  socket.on("can join room", (data: SocketJoinRoomData, callback: Callback) => {
    const errors = validateJoinRoom(socket, data);
    if (errors) {
      callback(false, errors);
      return;
    }
    callback(true);
  });

  socket.on("join room", (data: SocketJoinRoomData, callback: Callback) => {
    const errors = validateJoinRoom(socket, data);
    if (errors) {
      callback(false, errors);
      return;
    }

    const user = new User(socket.id, data.username, socket);
    users[socket.id] = user;

    const room = joinOrCreateRoom(user, data.room);
    socket.join(data.room);

    console.log(`User ${users[socket.id]?.name} joined room ${data.room} ${socket.rooms.size}`);
    callback(true, room.asInfo());
  });

  socket.on("get rooms", (callback: Callback) => {
    const result: GetRoomsData[] = [];

    rooms.forEach((room) => {
      result.push({
        name: room.name,
        userCount: room.users.size,
        max: ROOM_MAX_USERS
      });
    });

    callback(true, result);
  });

  socket.on("kick", (data: SocketKickData, callback: Callback) => {
    const current = users[socket.id];
    const errors = validateKick(data, current);

    if (errors) {
      callback(false, errors);
      return;
    }
    // existance checked before
    const room = rooms.get(data.room);
    const target = room?.get(data.username);

    if (target && room) {
      leaveRoom(target, room);
      target.socket.emit("kick", { room: data.room });
      console.log(`user ${data.username} has been kicked from ${data.room} room`);

      io.to(data.room).emit("room update", room.asInfo());

      callback(true);
    }
  });

  socket.on("disconnecting", () => {
    const user = users[socket.id];
    const room = getRoom(socket);

    if (user && room) {
      const roomInfo = leaveRoom(user, room);
      io.to(room.name).emit("room update", roomInfo);
    }
    console.log("user disconnected");
  });
}
