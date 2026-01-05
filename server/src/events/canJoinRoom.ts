import type { SocketJoinRoomData } from "client-types";
import type { Callback } from "../types/types";
import { validateJoinRoom } from "../validate/joinRoom";
import type { Socket } from "socket.io";

export function registerHandlers(socket: Socket) {
  socket.on("can join room", (data: SocketJoinRoomData, callback: Callback) => {
    const result = validateJoinRoom(socket, data);
    if (!result.status) {
      callback(result.status, result.error);
      return;
    }

    callback(true);
  });
}
