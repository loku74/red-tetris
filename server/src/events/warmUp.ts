import { EVENT_WARMUP_START } from "@app/shared";

import { warmUpLoop } from "@app/core/runners";
import type { AppServer, ServerSocket } from "@app/types/socket";
import { logger } from "@app/utils/log";
import { validateWarmUp } from "@app/validate/warmUp";

export function registerHandlers(io: AppServer, socket: ServerSocket) {
  socket.on(EVENT_WARMUP_START, async (callback) => {
    const result = validateWarmUp(socket);
    if (!result.status) {
      callback({ success: false });
      return;
    }

    logger.info(`User ${result.current.name} (${result.current.id}) has started a warm-up`);
    await result.current.setWarmUp(result.settings);
    warmUpLoop(io, result.current);

    callback({ success: true });
  });
}
