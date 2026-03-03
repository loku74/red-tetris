import {
  EVENT_GAME_COUNTDOWN,
  EVENT_GAME_DEAD,
  EVENT_GAME_FINISH,
  EVENT_GAME_INFO,
  EVENT_GAME_PENALITY,
  EVENT_GAME_SPECTRUM,
  EVENT_ROOM_UPDATE,
  EVENT_WARMUP_FINISH,
  EVENT_WARMUP_INFO
} from "@app/shared";

import { GAME_START_DELAY } from "@app/constants/core";
import type { Room } from "@app/objects/Room";
import type { User } from "@app/objects/User";
import type { AppServer } from "@app/types/socket";
import { sleep } from "@app/utils/sleep";

export async function gameLoop(io: AppServer, room: Room) {
  const game = room.game;
  if (!game) throw new Error("Game not prepared!");

  game.players.keys().forEach((id) => {
    io.to(id).emit(EVENT_GAME_INFO, game.getGameInfo(id));
  });

  for (let i = GAME_START_DELAY / 1000; i >= 0; i--) {
    io.to(room.name).emit(EVENT_GAME_COUNTDOWN, i);
    if (i) await sleep(1000);
  }

  game.ongoing = true;

  while (game.ongoing) {
    game.players.forEach(async (player, id) => {
      if (player.alive) {
        const nb = await player.mutex.runExclusive(() => {
          if (player.isNextPositionValid()) {
            player.actualPiece.moveDown();
          } else {
            player.attachCurrentPiece(game);
          }
          return player.board.cleanLines(game.settings.destructiblePenality);
        });

        if (nb > 0) {
          game.players.forEach(async (p) => {
            if (p != player) {
              await p.applyPenality(nb);
              io.to(p.user.id).emit(EVENT_GAME_PENALITY, game.getGameInfo(p.user.id));
            }
          });
        }

        if (player.checkLost()) {
          io.to(id).emit(EVENT_GAME_INFO, game.getGameInfo(id));
        } else {
          io.to(id).emit(EVENT_GAME_DEAD);
        }
      }

      io.to(id).emit(EVENT_GAME_INFO, game.getGameInfo(id));
    });

    io.to(room.name).emit(EVENT_GAME_SPECTRUM, game.getGameSpectrums());
    game.checkFinished();
    await sleep(game.settings.tick);
  }

  io.to(room.name).emit(EVENT_GAME_FINISH);
  room.game = null;
  io.to(room.name).emit(EVENT_ROOM_UPDATE, room.asInfo());
}

export async function warmUpLoop(io: AppServer, user: User) {
  const game = user.warmUp;
  if (!game) throw new Error("Game not prepared!");

  game.ongoing = true;
  io.to(user.id).emit(EVENT_WARMUP_INFO, game.getGameInfo(user.id));

  while (game.ongoing) {
    await sleep(game.settings.tick);
    game.players.forEach(async (player, id) => {
      await player.mutex.runExclusive(() => {
        if (player.isNextPositionValid()) {
          player.actualPiece.moveDown();
        } else {
          player.attachCurrentPiece(game);
        }
        player.board.cleanLines(game.settings.destructiblePenality);
      })
      player.checkLost();

      io.to(id).emit(EVENT_WARMUP_INFO, game.getGameInfo(id));
    });
    game.checkFinished();
  }

  io.to(user.id).emit(EVENT_WARMUP_FINISH);
  user.warmUp = null;
}
