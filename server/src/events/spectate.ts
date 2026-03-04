import { EVENT_GAME_SPECTATE } from "@app/shared";

import type { AppServer, ServerSocket } from "@app/types/socket";
import { logger } from "@app/utils/log";
import { validateSpectate } from "@app/validate/spectate";

export function registerHandlers(_io: AppServer, socket: ServerSocket) {
  socket.on(EVENT_GAME_SPECTATE, (payload, callback) => {
    const result = validateSpectate(socket, payload);
    if (!result.status) {
      callback({ success: false });
      return;
    }

    if (result.currentPlayer.spectating) {
      result.currentPlayer.spectating.spectators.delete(result.currentPlayer);
    }

    result.currentPlayer.spectating = result.spectatedPlayer;
    result.spectatedPlayer.spectators.add(result.currentPlayer);

    logger.info(
      `User ${result.currentPlayer.user.name} (id: ${result.currentPlayer.user.id}) is spectating
       user ${result.spectatedPlayer.user.name} (id: ${result.spectatedPlayer.user.id})`
    );

    callback({ success: true, data: { username: result.spectatedPlayer.user.name } });
  });
}
