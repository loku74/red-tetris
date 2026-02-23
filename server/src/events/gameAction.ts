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
      socket.to(result.room.name).emit(EVENT_GAME_PENALITY, { from: result.player.user.name });
    }

    callback({ success: true, data: result.game.getGameInfo(socket.id) });
  });
}
