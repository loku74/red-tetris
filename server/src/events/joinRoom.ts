import type { SocketJoinRoomData } from "client-types";
import { validateJoinRoom } from "../validate/joinRoom";
import type { Callback } from "../types/types";
import { User, users } from "../objects/User";
import { joinOrCreateRoom } from "../objects/Room";
import type { Socket } from "socket.io";

export function registerHandlers(socket: Socket) {
  socket.on("join room", (data: SocketJoinRoomData, callback: Callback) => {
    const result = validateJoinRoom(socket, data);
    if (!result.status) {
      callback(false, result.error);
      return;
    }

    const user = new User(socket.id, result.username, socket);
    users.set(socket.id, user);

    const room = joinOrCreateRoom(user, result.roomName);
    socket.join(data.room);

    user.socket.to(result.roomName).emit("room update", room.asInfo());

    console.log(`User ${result.username} joined room ${result.roomName} ${socket.rooms.size}`);

    callback(true, room.asInfo());
  });
}
