import { Server, type Socket } from "socket.io";
import { users } from "../objects/User";
import type { SocketStartData } from "client-types";
import type { Callback } from "../types/types";
import { validateStart } from "../validate/start";
import { rooms } from "../objects/Room";

export function registerHandlers(io: Server, socket: Socket) {
  socket.on("start", (data: SocketStartData, callback: Callback) => {
    const current = users.get(socket.id);
    const errors = validateStart(data, current);

    if (errors) {
      callback(false, errors);
      return;
    }

    const room = rooms.get(data.room);

    if (room) {
      room.start();
      callback(true);

      io.to(data.room).emit("room start", room.asInfo());
      // then send the board info (with the next 4 pieces) to each person
    }
  });
}
