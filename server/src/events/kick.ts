import { Server, type Socket } from "socket.io";
import { validateKick } from "../validate/kick";
import type { SocketKickData } from "client-types";
import type { Callback } from "../types/types";
import { removeUserFromRoom } from "../core/room";

export function registerHandlers(io: Server, socket: Socket) {
  socket.on("kick", (data: SocketKickData, callback: Callback) => {
    const result = validateKick(socket, data);
    if (!result.status) {
      callback(result.status, result.error);
      return;
    }

    const roomInfo = removeUserFromRoom(result.targetUser, result.room);
    result.targetUser.socket.emit("kick", { room: result.room.name });
    io.to(result.room.name).emit("room update", roomInfo);

    console.log(
      `User ${result.targetUser.name} was kicked from room ${result.room.name} by ${result.current.name}`
    );

    callback(true);
  });
}
