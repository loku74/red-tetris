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
    const { nbCleanedLines, gameData } = await applyMovement(
      result.game,
      result.player,
      result.action
    );

    if (nbCleanedLines > 0) {
      result.game.players.forEach(async (p) => {
        const gameScore = result.game.getScore(nbCleanedLines);

        if (gameScore) {
          result.player.score += gameScore.score;
          gameData.gameScore = gameScore;
        }

        if (p != result.player) {
          await p.applyPenality(nbCleanedLines);
          socket.to(p.user.id).emit(EVENT_GAME_PENALITY, gameData);
        }
      });
    }

    callback({ success: true, data: gameData });
  });
}
