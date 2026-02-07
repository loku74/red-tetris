// const
import {
  EVENT_GAME_FINISH,
  EVENT_GAME_INFO,
  EVENT_GAME_PENALITY,
  EVENT_GAME_SPECTRUM,
  EVENT_WARMUP_FINISH,
  EVENT_WARMUP_INFO,
  type Settings
} from "@app/shared";
import { GAME_START_DELAY } from "../constants/core";

// intern
import { sleep } from "../utils/sleep";
import { helpers } from "./game";

// types
import type { Room } from "../objects/Room";
import type { AppServer } from "../types/socket";
import type { User } from "../objects/User";

export async function gameLoop(io: AppServer, room: Room, settings: Settings) {
  const game = room.game;
  if (!game) throw new Error("Game not prepared!");

  game.players.keys().forEach((id) => {
    io.to(id).emit(EVENT_GAME_INFO, game.getGameInfo(id));
  });

  await sleep(GAME_START_DELAY);
  game.ongoing = true;

  const timer = setInterval(() => {
    if (game.isFinished()) {
      room.game = null;
      io.to(room.name).emit(EVENT_GAME_FINISH, {});
      clearInterval(timer);
    } else {
      game.players.forEach((player, id) => {
        if (!player.alive) return;
        if (helpers.isNextPositionValid(player)) {
          player.actualPiece.moveDown();
        } else {
          helpers.attachCurrentPiece(game, player, io);

          if (player.board.cleanLines() > 0) {
            helpers.applyPenality(game, player);
            io.to(room.name).emit(EVENT_GAME_PENALITY, { from: player.user.name });
          }
        }

        io.to(room.name).emit(EVENT_GAME_SPECTRUM, game.getGameSpectrums(id));
        io.to(id).emit(EVENT_GAME_INFO, game.getGameInfo(id));
      });
    }
  }, settings.tick);
}

export async function warmUpLoop(io: AppServer, user: User, settings: Settings) {
  const game = user.warmUp;
  if (!game) throw new Error("Game not prepared!");

  game.ongoing = true;
  io.to(user.id).emit(EVENT_WARMUP_INFO, game.getGameInfo(user.id));

  const timer = setInterval(() => {
    if (game.isFinished()) {
      user.warmUp = null;
      io.to(user.id).emit(EVENT_WARMUP_FINISH, {});
      clearInterval(timer);
    } else {
      game.players.forEach((player, id) => {
        if (helpers.isNextPositionValid(player)) {
          player.actualPiece.moveDown();
        } else {
          helpers.attachCurrentPiece(game, player, io);
        }

        io.to(id).emit(EVENT_WARMUP_INFO, game.getGameInfo(id));
      });
    }
  }, settings.tick);
}
