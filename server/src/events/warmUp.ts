// global
import { EVENT_WARMUP_START } from "@app/shared";

// intern
import { validateWarmUp } from "../validate/warmUp";
import { warmUpLoop } from "../core/runners";

// types
import type { AppServer, ServerSocket } from "../types/socket";

export function registerHandlers(io: AppServer, socket: ServerSocket) {
  socket.on(EVENT_WARMUP_START, async (payload, callback) => {
    const result = validateWarmUp(socket, payload);
    if (!result.status) {
      callback({ success: false });
      return;
    }

    console.log(`user ${result.current.name} started warm-up`);
    await result.current.setWarmUp();
    warmUpLoop(io, result.current, result.GameSettings);

    callback({ success: true });
  });
}
