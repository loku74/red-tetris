// global
import { EVENT_WARMUP_ACTION } from "@app/shared";

// intern
import { validateWarmUpAction } from "../validate/warmUpAction";

// types
import type { ServerSocket } from "../types/socket";
import { applyMovement } from "../core/movements";

export function registerHandlers(socket: ServerSocket) {
  socket.on(EVENT_WARMUP_ACTION, (payload, callback) => {
    const result = validateWarmUpAction(socket, payload);

    if (!result.status) {
      callback({ success: false });
      return;
    }

    applyMovement(result.game, result.player, result.action);

    callback({ success: true, data: result.game.getGameInfo(socket.id) });
  });
}
