// global
import { Server, Socket } from "socket.io";

// intern
import { EVENT_GAME_START } from "../constants/events";
import { validateStart } from "../validate/start";

// types
import type { Callback } from "../types/types";

export function registerHandlers(io: Server, socket: Socket) {
  socket.on(EVENT_GAME_START, (callback: Callback) => {
    const result = validateStart(socket);
    if (!result.status) {
      callback(result.status, result.error);
      return;
    }

    const room = result.room;
    room.start();

    io.to(result.room.name).emit(EVENT_GAME_START, room.asInfo());
    // then send the board info (with the next 4 pieces) to each person

    callback(true);
  });
}
