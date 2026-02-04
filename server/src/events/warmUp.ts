// global
import { EVENT_WARMUP_START } from "@app/shared";

// intern
import { validateWarmUp } from "../validate/warmUp";
import { warmupLoop } from "../core/warmup";

// types
import type { AppServer, ServerSocket } from "../types/socket";

export function registerHandlers(io: AppServer, socket: ServerSocket) {
  socket.on(EVENT_WARMUP_START, (callback) => {
    const result = validateWarmUp(socket);
    if (!result.status) {
      callback({ success: false });
      return;
    }

    console.log(`user ${result.current.name} started warm-up`);
    result.current.setWarmUp();
    warmupLoop(result.current, io);

    callback({ success: true });
  });
}
