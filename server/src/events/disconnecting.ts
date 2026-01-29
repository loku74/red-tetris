// global
import { EVENT_ROOM_UPDATE, EVENT_USER_DISCONNECT } from "@app/shared";

// intern
import { getRoomBySocket } from "../core/room";
import { getUser } from "../core/user";

// types
import type { AppServer, ServerSocket } from "../types/socket";

export function registerHandlers(io: AppServer, socket: ServerSocket) {
  socket.on(EVENT_USER_DISCONNECT, () => {
    const user = getUser(socket.id);
    const room = getRoomBySocket(socket);

    if (user && room) {
      const roomInfo = room.remove(user);

      socket.leave(room.name);
      io.to(room.name).emit(EVENT_ROOM_UPDATE, roomInfo);
    }

    console.log("user disconnected");
  });
}
