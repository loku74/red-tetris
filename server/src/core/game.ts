import type { Game } from "../objects/Game";
import type { Room } from "../objects/Room";
import type { Player } from "../objects/Player";
import { GAME_TICK_DEFAULT, GAME_START_DELAY } from "../constants/core";
import {
  EVENT_GAME_FINISH,
  EVENT_GAME_INFO,
  EVENT_GAME_PENALITY,
  EVENT_GAME_SPECTRUM
} from "@app/shared";
import type { AppServer } from "../types/socket";

export const helpers = {
  applyPenality(game: Game, from: Player) {
    game.players.forEach((player) => {
      if (!player.alive || player === from) return;
      player.board.addRestrictedLine();
    });
  },

  attachActualPiece(game: Game, player: Player): number {
    // fix the actual piece
    player.board.place(player.actualPiece);

    // generate a new valid piece
    player.actualPiece = game.nextPiece(player.board.placedPieces);

    // clear the lines
    return player.board.cleanLines();
  },

  handleGravity(game: Game, player: Player): { penality: boolean; attached: boolean } {
    const next = player.actualPiece.clone().moveDown();
    let penality = false,
      attached = false;

    if (!player.board.isValidPiece(next)) {
      // piece reach bottom
      attached = true;
      if (helpers.attachActualPiece(game, player) > 0) {
        penality = true;
      }

      if (player.hasLost()) {
        player.alive = false;
      } else {
        player.score++;
      }
    } else {
      // apply gravity
      player.actualPiece.moveDown();
    }
    return { penality: penality, attached: attached };
  }
};

export async function gameLoop(room: Room, io: AppServer) {
  const game = room.game;
  if (!game) throw new Error("Game not prepared!");

  game.players.keys().forEach((id) => {
    io.to(id).emit(EVENT_GAME_INFO, game.getGameInfo(id));
  });

  // delay start of game to synchronize all clients
  await new Promise((resolve) => setTimeout(resolve, GAME_START_DELAY));
  game.ongoing = true;

  // the game runner
  const timer = setInterval(() => {
    game.players.forEach((player, id) => {
      if (!player.alive) return;

      const { penality, attached } = helpers.handleGravity(game, player);
      if (game.isFinish()) {
        clearInterval(timer);
        io.to(room.name).emit(EVENT_GAME_FINISH, {});
        room.finish();
        return;
      }

      if (penality) {
        helpers.applyPenality(game, player);

        io.to(room.name).emit(EVENT_GAME_PENALITY, {
          from: player.user.name
        });
      }

      if (attached || !player.alive) {
        // warm only lose/attach new piece
        io.to(room.name).emit(EVENT_GAME_SPECTRUM, game.getGameSpectrum(id));
      }

      io.to(id).emit(EVENT_GAME_INFO, game.getGameInfo(id));
    });
  }, GAME_TICK_DEFAULT);
}
