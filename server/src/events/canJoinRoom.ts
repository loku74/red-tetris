import type { SocketJoinRoomData } from "client-types";
import type { Callback } from "../types/types";
import { validateJoinRoom } from "../validate/room";
import type { Socket } from "socket.io";

export function registerHandlers(socket: Socket) {
  socket.on("can join room", (data: SocketJoinRoomData, callback: Callback) => {
    const errors = validateJoinRoom(socket, data);
    if (errors) {
      callback(false, errors);
      return;
    }
    callback(true);
  });
}
