// const
import {
  EVENT_GAME_FINISH,
  EVENT_GAME_INFO,
  EVENT_GAME_PENALITY,
  EVENT_GAME_SPECTRUM,
  EVENT_WARMUP_FINISH,
  EVENT_WARMUP_INFO
} from "@app/shared";
import { GAME_START_DELAY, GAME_TICK_DEFAULT } from "../constants/core";

// intern
import { sleep } from "../utils/sleep";
import { helpers } from "./game";

// types
import type { Room } from "../objects/Room";
import type { AppServer } from "../types/socket";
import type { User } from "../objects/User";

export async function gameLoop(room: Room, io: AppServer) {
  const game = room.game;
  if (!game) throw new Error("Game not prepared!");

  game.players.keys().forEach((id) => {
    io.to(id).emit(EVENT_GAME_INFO, game.getGameInfo(id));
  });

  // delay start of game to synchronize all clients
  await sleep(GAME_START_DELAY);
  game.ongoing = true;

  // the game runner
  const timer = setInterval(() => {
    game.players.forEach((player, id) => {
      if (!player.alive) return;

      const penality = helpers.handleGravity(game, player);
      if (game.isFinished()) {
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

      io.to(room.name).emit(EVENT_GAME_SPECTRUM, game.getGameSpectrums(id));
      io.to(id).emit(EVENT_GAME_INFO, game.getGameInfo(id));
    });
  }, GAME_TICK_DEFAULT);
}

export async function warmUpLoop(user: User, io: AppServer) {
  const game = user.warmUp;
  if (!game) throw new Error("Game not prepared!");

  game.ongoing = true;
  io.to(user.id).emit(EVENT_WARMUP_INFO, game.getGameInfo(user.id));

  const timer = setInterval(() => {
    game.players.forEach((player, id) => {
      if (game.isFinished()) {
        user.warmUp = null;
        io.to(user.id).emit(EVENT_WARMUP_FINISH, {});
        clearInterval(timer);
        return;
      }
      helpers.handleGravity(game, player);

      io.to(id).emit(EVENT_WARMUP_INFO, game.getGameInfo(id));
    });
  }, GAME_TICK_DEFAULT);
}
