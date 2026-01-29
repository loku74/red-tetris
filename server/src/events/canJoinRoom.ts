// global
import { EVENT_CAN_JOIN_ROOM } from "@app/shared";

// intern
import { validateJoinRoom } from "../validate/joinRoom";

// types
import type { ServerSocket } from "../types/socket";

export function registerHandlers(socket: ServerSocket) {
  socket.on(EVENT_CAN_JOIN_ROOM, (payload, callback) => {
    const result = validateJoinRoom(socket, payload);
    if (!result.status) {
      callback({ success: result.status, error: result.error });
      return;
    }

    callback({ success: true, data: { roomName: result.roomName, username: result.username } });
  });
}
