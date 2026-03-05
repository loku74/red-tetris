import { EVENT_GAME_ACTION, EVENT_GAME_INFO, EVENT_GAME_PENALITY } from "@app/shared";

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

    const gameData = await result.player.mutex.runExclusive(async () => {
      const { nbCleanedLines, gameData } = applyMovement(result.game, result.player, result.action);

      if (nbCleanedLines > 0) {
        for (const p of result.game.players.values()) {
          const gameScore = result.game.getScore(nbCleanedLines);

          if (gameScore) {
            result.player.score += gameScore.score;
            gameData.gameScore = gameScore;
          }

          if (p != result.player && p.alive) {
            const targetGameData = await p.applyPenality(result.game, nbCleanedLines);
            socket.to(p.user.id).emit(EVENT_GAME_PENALITY, targetGameData);
          }
        }
      }
      return gameData;
    });

    result.player.spectators.forEach((spectator) => {
      socket.to(spectator.user.id).emit(EVENT_GAME_INFO, gameData);
    });

    callback({ success: true, data: gameData });
  });
}
