// types
import type { Server } from "socket.io";
import type { User } from "../objects/User";

// others
import { EVENT_WARMUP_FINISH, EVENT_WARMUP_INFO } from "@app/shared";
import { GAME_TICK_DEFAULT } from "../constants/core";
import { helpers } from "./game";

export async function warmupLoop(user: User, io: Server) {
  const game = user.warmUp;
  if (!game) throw new Error("Game not prepared!");

  game.ongoing = true;
  io.to(user.id).emit(EVENT_WARMUP_INFO, game.getGameInfo(user.id));

  const timer = setInterval(() => {
    game.players.forEach((player, id) => {
      if (!player.alive) return;

      helpers.handleGravity(game, player);
      if (game.isFinish()) {
        clearInterval(timer);
        io.to(user.id).emit(EVENT_WARMUP_FINISH, {});
        user.warmUp = null;
        return;
      }

      io.to(id).emit(EVENT_WARMUP_INFO, game.getGameInfo(id));
    });
  }, GAME_TICK_DEFAULT);
}
