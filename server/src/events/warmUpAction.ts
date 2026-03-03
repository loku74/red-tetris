import { EVENT_WARMUP_ACTION } from "@app/shared";

import { applyMovement } from "@app/core/movements";
import type { ServerSocket } from "@app/types/socket";
import { validateWarmUpAction } from "@app/validate/warmUpAction";

export function registerHandlers(socket: ServerSocket) {
  socket.on(EVENT_WARMUP_ACTION, async (payload, callback) => {
    const result = validateWarmUpAction(socket, payload);

    if (!result.status) {
      callback({ success: false });
      return;
    }

    const { nbCleanedLines, gameData } = await applyMovement(
      result.game,
      result.player,
      result.action
    );

    const gameScore = result.game.getScore(nbCleanedLines);
    if (gameScore) {
      result.player.score += gameScore.score;
      gameData.gameScore = gameScore;
    }

    callback({ success: true, data: gameData });
  });
}
