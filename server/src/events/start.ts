// global
import { EVENT_GAME_START } from "@app/shared";

// intern
import { validateStart } from "../validate/start";

// types
import type { AppServer, ServerSocket } from "../types/socket";

export function registerHandlers(io: AppServer, socket: ServerSocket) {
  socket.on(EVENT_GAME_START, (callback) => {
    const result = validateStart(socket);
    if (!result.status) {
      callback({ success: false, error: result.error });
      return;
    }

    const room = result.room;
    room.start();

    io.to(result.room.name).emit(EVENT_GAME_START, room.asInfo());
    // then send the board info (with the next 4 pieces) to each person

    callback({ success: true });
  });
}
