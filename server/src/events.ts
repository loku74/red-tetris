import type { Socket } from "socket.io";
import type { Callback, GetRoomsData, JoinRoomData } from "./types";
import { getRoomId, joinOrCreateRoom, leaveRoom, validateJoinRoom } from "./controllers/rooms";
import { ROOM_MAX_USERS } from "./constants";
import { User, users } from "./objects/User";
import { rooms } from "./objects/Room";

export function registerClientHandlers(socket: Socket) {
  socket.on("join room", (data: JoinRoomData, callback: Callback) => {
    const errors = validateJoinRoom(socket, data);
    if (errors) {
      callback(errors, { success: false });
      return;
    }

    const user = new User(data.username);
    users[socket.id] = user;

    joinOrCreateRoom(data.room, user);
    socket.join(data.room);

    console.log(`User ${users[socket.id]?.name} joined room ${data.room} ${socket.rooms.size}`);
    callback(null, { success: true });
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

  socket.on("disconnect", () => {
    const user = users[socket.id];
    const room_id = getRoomId(socket);

    if (user != undefined && room_id != undefined) {
      leaveRoom(room_id, user);
    }
    console.log("user disconnected");
  });
}
