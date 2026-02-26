import { EVENT_GAME_ACTION, EVENT_GAME_PENALITY } from "@app/shared";

import { applyMovement } from "@app/core/movements";
import type { ServerSocket } from "@app/types/socket";
import { validateGameAction } from "@app/validate/gameAction";

export function registerHandlers(socket: ServerSocket) {
  socket.on(EVENT_GAME_ACTION, (payload, callback) => {
    const result = validateGameAction(socket, payload);

    if (!result.status) {
      callback({ success: false });
      return;
    }

    if (applyMovement(result.game, result.player, result.action)) {
      result.game.players.forEach((p) => {
        if (p != result.player) {
          p.applyPenality();
          socket.to(p.user.id).emit(EVENT_GAME_PENALITY, result.game.getGameInfo(p.user.id));
        }
      });
    }

    callback({ success: true, data: result.game.getGameInfo(socket.id) });
  });
}
