// global
import { EVENT_WARMUP_ACTION } from "@app/shared";

// intern
import { validateWarmUpAction } from "../validate/warmUpAction";
import { applyMovement } from "../core/movements";

// types
import type { AppServer, ServerSocket } from "../types/socket";

export function registerHandlers(io: AppServer, socket: ServerSocket) {
  socket.on(EVENT_WARMUP_ACTION, (payload, callback) => {
    const result = validateWarmUpAction(socket, payload);

    if (!result.status) {
      callback({ success: false });
      return;
    }

    applyMovement(io, result.game, result.player, result.action);

    callback({ success: true, data: result.game.getGameInfo(socket.id) });
  });
}
