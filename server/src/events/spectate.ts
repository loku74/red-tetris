import { EVENT_GAME_RESET_SPECTATE, EVENT_GAME_SPECTATE } from "@app/shared";

import { getRoomBySocket } from "@app/core/room";
import type { AppServer, ServerSocket } from "@app/types/socket";
import { logger } from "@app/utils/log";
import { validateSpectate } from "@app/validate/spectate";

export function registerHandlers(io: AppServer, socket: ServerSocket) {
  socket.on(EVENT_GAME_SPECTATE, (payload, callback) => {
    const result = validateSpectate(socket, payload);
    if (!result.status) {
      callback({ success: false });
      return;
    }

    if (result.currentPlayer.spectating) {
      result.currentPlayer.spectating.spectators.delete(result.currentPlayer);
      io.to(result.currentPlayer.spectating.user.id).emit(
        EVENT_GAME_SPECTATE,
        result.currentPlayer.spectating.spectators.size
      );
    }

    result.currentPlayer.spectating = result.spectatedPlayer;
    result.spectatedPlayer.spectators.add(result.currentPlayer);

    logger.info(
      `User ${result.currentPlayer.user.name} (id: ${result.currentPlayer.user.id}) is spectating user ${result.spectatedPlayer.user.name} (id: ${result.spectatedPlayer.user.id})`
    );

    io.to(result.spectatedPlayer.user.id).emit(
      EVENT_GAME_SPECTATE,
      result.spectatedPlayer.spectators.size
    );

    callback({
      success: true,
      data: {
        userData: result.spectatedPlayer.user.getData(),
        gameData: result.game.getGameInfo(result.spectatedPlayer.user.id)
      }
    });
  });

  socket.on(EVENT_GAME_RESET_SPECTATE, (callback) => {
    const room = getRoomBySocket(socket);

    if (room && room.game) {
      const player = room.game.getPlayer(socket.id);

      if (player.spectating) {
        player.spectating.spectators.delete(player);

        io.to(player.spectating.user.id).emit(
          EVENT_GAME_SPECTATE,
          player.spectating.spectators.size
        );

        player.spectating = null;
      }
    }

    callback({ success: true });
  });
}
