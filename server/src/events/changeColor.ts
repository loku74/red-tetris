import { EVENT_CHANGE_COLOR, EVENT_ROOM_UPDATE } from "@app/shared";

import type { AppServer, ServerSocket } from "@app/types/socket";
import { validateChangeColor } from "@app/validate/changeColor";

export function registerHandlers(io: AppServer, socket: ServerSocket) {
  socket.on(EVENT_CHANGE_COLOR, (payload, callback) => {
    const result = validateChangeColor(socket, payload);
    if (!result.status) {
      callback({ success: false, error: result.error });
      return;
    }

    const room = result.room;
    const current = result.current;
    const color = result.color;

    room.colors.splice(result.colorIndex, 1);
    room.colors.push(current.color);
    current.color = color;

    io.to(room.name).emit(EVENT_ROOM_UPDATE, room.asInfo());

    callback({ success: true, data: { color } });
  });
}
