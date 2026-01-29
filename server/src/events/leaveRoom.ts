// global
import { EVENT_LEAVE_ROOM, EVENT_ROOM_UPDATE } from "@app/shared";

// intern
import { removeUserFromRoom } from "../core/room";
import { validateLeaveRoom } from "../validate/leaveRoom";

// types
import type { AppServer, ServerSocket } from "../types/socket";

export function registerHandlers(io: AppServer, socket: ServerSocket) {
  socket.on(EVENT_LEAVE_ROOM, (callback) => {
    const result = validateLeaveRoom(socket);
    if (!result.status) {
      callback({ success: false, error: result.error });
      return;
    }

    const roomInfo = removeUserFromRoom(result.current, result.room);
    io.to(result.room.name).emit(EVENT_ROOM_UPDATE, roomInfo);

    console.log(`User ${result.current.name} left room ${result.room.name}`);

    callback({ success: true });
  });
}
