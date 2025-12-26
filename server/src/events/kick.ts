import { Server, type Socket } from "socket.io";
import { users } from "../objects/User";
import { validateKick } from "../validate/kick";
import { rooms } from "../objects/Room";
import type { SocketKickData } from "client-types";
import type { Callback } from "../types/types";

export function registerHandlers(io: Server, socket: Socket) {
  socket.on("kick", (data: SocketKickData, callback: Callback) => {
    const current = users.get(socket.id);
    const errors = validateKick(data, current);

    if (errors) {
      callback(false, errors);
      return;
    }
    // existance checked before
    const room = rooms.get(data.room);
    const target = room?.get(data.username);

    if (target && room) {
      room.remove(target);
      target.socket.emit("kick", { room: data.room });
      console.log(`user ${data.username} has been kicked from ${data.room} room`);

      io.to(data.room).emit("room update", room.asInfo());

      callback(true);
    }
  });
}
