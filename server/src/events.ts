import { Server, type Socket } from "socket.io";
import { ROOM_MAX_USERS } from "./constants";
import {
  getRoomId,
  joinOrCreateRoom,
  leaveRoom,
  validateJoinRoom,
  validateKick
} from "./controllers/rooms";
import { rooms } from "./objects/Room";
import { User, users } from "./objects/User";
import type { Callback, GetRoomsData, JoinRoomData, KickData } from "./types";

export function registerClientHandlers(io: Server, socket: Socket) {
  socket.on("join room", (data: JoinRoomData, callback: Callback) => {
    const errors = validateJoinRoom(socket, data);
    if (errors) {
      callback(errors, { success: false });
      return;
    }

    const user = new User(socket.id, data.username, socket);
    users[socket.id] = user;

    const room = joinOrCreateRoom(user, data.room);
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

  socket.on("kick", (data: KickData, callback: Callback) => {
    const current = users[socket.id];
    const errors = validateKick(data, current);

    if (errors) {
      callback(errors, { success: false });
      return;
    }
    // existance checked before
    const target = rooms.get(data.room)?.get(data.username);

    if (target) {
      leaveRoom(target, data.room);
      target.socket.emit("kick", { room: data.room });
      console.log(`user ${data.username} has been kicked from ${data.room} room`);

      callback(null, { success: true });
    } else {
      // this should never happen since the existence is
      // checked inside validateKick
      callback({ kick: `The user ${data.username} is not in the room!` }, { success: false });
    }
  });

  socket.on("disconnecting", () => {
    const user = users[socket.id];
    const room_id = getRoomId(socket);

    if (user != undefined && room_id != undefined) {
      leaveRoom(user, room_id);
    }
    console.log("user disconnected");
  });
}
