// global
import { EVENT_WARM_UP } from "@app/shared";

// intern
import { validateWarmUp } from "../validate/warmUp";

// types
import type { ServerSocket } from "../types/socket";

export function registerHandlers(socket: ServerSocket) {
  socket.on(EVENT_WARM_UP, (callback) => {
    const result = validateWarmUp(socket);
    if (!result.status) {
      callback({ success: false, error: result.error });
      return;
    }

    result.current.setWarmUp();

    console.log(`user ${result.current.name} started warm-up`);

    callback({ success: true });
  });
}
