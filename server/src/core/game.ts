// intern
import { EVENT_GAME_INFO } from "@app/shared";

// types
import type { Game } from "../objects/Game";
import type { Player } from "../objects/Player";
import type { AppServer } from "../types/socket";

export const helpers = {
  applyPenality(game: Game, from: Player) {
    game.players.forEach((player) => {
      if (!player.alive || player === from) return;
      player.board.addRestrictedLine();
    });
  },

  attachCurrentPiece(game: Game, player: Player, io: AppServer) {
    const id = player.user.id;

    player.board.place(player.actualPiece);
    player.actualPiece = game.nextPiece(player.board.placedPieces);

    if (player.hasLost()) {
      player.alive = false;
      io.to(id).emit(EVENT_GAME_INFO, game.getGameInfo(id));
    } else {
      player.score++;
    }
  }
};
