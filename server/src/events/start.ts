import { Server, type Socket } from "socket.io";
import type { Callback } from "../types/types";
import { validateStart } from "../validate/start";

export function registerHandlers(io: Server, socket: Socket) {
  socket.on("start", (callback: Callback) => {
    const result = validateStart(socket);
    if (!result.status) {
      callback(result.status, result.error);
      return;
    }

    const room = result.room;
    room.start();

    io.to(result.room.name).emit("room start", room.asInfo());
    // then send the board info (with the next 4 pieces) to each person

    callback(true);
  });
}
