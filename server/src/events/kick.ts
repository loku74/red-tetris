// global
import { EVENT_KICK, EVENT_ROOM_UPDATE } from "@app/shared";

// intern
import { removeUserFromRoom } from "../core/room";
import { validateKick } from "../validate/kick";

// types
import type { AppServer, ServerSocket } from "../types/socket";

export function registerHandlers(io: AppServer, socket: ServerSocket) {
  socket.on(EVENT_KICK, (payload, callback) => {
    const result = validateKick(socket, payload);
    if (!result.status) {
      callback({ success: result.status, error: result.error });
      return;
    }

    const roomInfo = removeUserFromRoom(result.targetUser, result.room);
    result.targetUser.socket.emit(EVENT_KICK, { room: result.room.name });
    io.to(result.room.name).emit(EVENT_ROOM_UPDATE, roomInfo);

    console.log(
      `User ${result.targetUser.name} was kicked from room ${result.room.name} by ${result.current.name}`
    );

    callback({ success: true });
  });
}
