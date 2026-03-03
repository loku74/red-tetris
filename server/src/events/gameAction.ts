import { EVENT_GAME_ACTION, EVENT_GAME_PENALITY } from "@app/shared";

import { applyMovement } from "@app/core/movements";
import type { ServerSocket } from "@app/types/socket";
import { validateGameAction } from "@app/validate/gameAction";

export function registerHandlers(socket: ServerSocket) {
  socket.on(EVENT_GAME_ACTION, async (payload, callback) => {
    const result = validateGameAction(socket, payload);

    if (!result.status) {
      callback({ success: false });
      return;
    }
    const nb = await applyMovement(result.game, result.player, result.action);

    if (nb > 0) {
      result.game.players.forEach(async (p) => {
        if (p != result.player) {
          await p.applyPenality(nb);
          socket.to(p.user.id).emit(EVENT_GAME_PENALITY, result.game.getGameInfo(p.user.id));
        }
      });
    }

    callback({ success: true, data: result.game.getGameInfo(socket.id) });
  });
}
