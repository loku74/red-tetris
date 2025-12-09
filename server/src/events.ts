import { Server, type Socket } from "socket.io";
import { ROOM_MAX_USERS } from "./constants";
import { getRoomId, joinOrCreateRoom, leaveRoom, validateJoinRoom } from "./controllers/rooms";
import { rooms } from "./objects/Room";
import { User, users } from "./objects/User";
import type { Callback, GetRoomsData, JoinRoomData } from "./types";

export function registerClientHandlers(io: Server, socket: Socket) {
  socket.on("join room", (data: JoinRoomData, callback: Callback) => {
    const errors = validateJoinRoom(socket, data);
    if (errors) {
      callback(errors, { success: false });
      return;
    }

    const user = new User(socket.id, data.username);
    users[socket.id] = user;

    const room = joinOrCreateRoom(socket, data.room, user);
    socket.join(data.room);

    console.log(`User ${users[socket.id]?.name} joined room ${data.room} ${socket.rooms.size}`);
    callback(null, { success: true, room: room.asInfo() });
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

    callback(null, { rooms: result });
  });

  socket.on("disconnecting", () => {
    const user = users[socket.id];
    const room_id = getRoomId(socket);

    if (user != undefined && room_id != undefined) {
      leaveRoom(io, room_id, user);
    }
    console.log("user disconnected");
  });
}
