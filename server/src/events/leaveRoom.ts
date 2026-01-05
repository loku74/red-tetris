import type { SocketLeaveRoomData } from "client-types";
import type { Callback } from "../types/types";
import { users } from "../objects/User";
import type { Server, Socket } from "socket.io";
import { validateLeaveRoom } from "../validate/leaveRoom";
import { removeUserFromRoom } from "../core/room";

export function registerHandlers(io: Server, socket: Socket) {
  socket.on("leave room", (data: SocketLeaveRoomData, callback: Callback) => {
    const current = users.get(socket.id);
    const result = validateLeaveRoom(data, current);

    if (!result.status) {
      callback(result.status, result.error);
      return;
    }

    const roomInfo = removeUserFromRoom(result.current, result.room);
    io.to(result.room.name).emit("room update", roomInfo);

    console.log(`User ${result.current.name} left room ${result.room.name}`);

    callback(result.status);
  });
}
