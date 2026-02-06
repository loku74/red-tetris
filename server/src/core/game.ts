import type { Game } from "../objects/Game";
import type { Player } from "../objects/Player";

export const helpers = {
  applyPenality(game: Game, from: Player) {
    game.players.forEach((player) => {
      if (!player.alive || player === from) return;
      player.board.addRestrictedLine();
    });
  },

  attachActualPiece(game: Game, player: Player): number {
    player.board.place(player.actualPiece);
    player.actualPiece = game.nextPiece(player.board.placedPieces);

    return player.board.cleanLines();
  },

  goToNextPiece(game: Game, player: Player): boolean {
    let penality = false;

    if (helpers.attachActualPiece(game, player) > 0) {
      penality = true;
    }
    if (player.hasLost()) {
      player.alive = false;
    } else {
      player.score++;
    }
    return penality;
  },

  handleGravity(game: Game, player: Player): boolean {
    const next = player.actualPiece.clone().moveDown();
    let penality = false;

    if (!player.board.isValidPiece(next)) {
      penality = helpers.goToNextPiece(game, player);
    } else {
      // apply gravity
      player.actualPiece.moveDown();
    }
    return penality;
  }
};
