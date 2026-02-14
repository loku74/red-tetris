// global
import { EVENT_KICK, EVENT_ROOM_UPDATE } from "@app/shared";

// intern
import { removeUserFromRoom } from "../core/room";
import { validateKick } from "../validate/kick";
import { logger } from "../utils/log";

// types
import type { AppServer, ServerSocket } from "../types/socket";

export function registerHandlers(io: AppServer, socket: ServerSocket) {
  socket.on(EVENT_KICK, (payload, callback) => {
    const result = validateKick(socket, payload);
    if (!result.status) {
      callback({ success: false });
      return;
    }

    const roomInfo = removeUserFromRoom(result.targetUser, result.room);
    result.targetUser.socket.emit(EVENT_KICK, { room: result.room.name });
    io.to(result.room.name).emit(EVENT_ROOM_UPDATE, roomInfo);

    logger.info(
      `User ${result.targetUser.name} (id: ${result.targetUser.id}) was kicked from room "${result.room.name}" by ${result.current.name} (id: ${result.current.id})`
    );

    callback({ success: true });
  });
}
