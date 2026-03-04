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
import type { Game } from "@app/objects/Game";
import type { Player } from "@app/objects/Player";
import type { Room } from "@app/objects/Room";
import type { User } from "@app/objects/User";
import type { AppServer } from "@app/types/socket";
import { sleep } from "@app/utils/sleep";

function setDeadPlayer(io: AppServer, game: Game, player: Player) {
  game.addDeadPlayer(player);
  io.to(player.user.id).emit(EVENT_GAME_DEAD);
}

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
    for (const [id, player] of game.players) {
      if (player.alive) {
        const { nbCleanedLines, gameInfo } = await player.mutex.runExclusive(() => {
          if (player.isNextPositionValid()) {
            player.actualPiece.moveDown();
          } else {
            player.attachCurrentPiece(game);
          }
          const nbCleanedLines = player.board.cleanLines(game.settings.destructiblePenality);
          const gameInfo = game.getGameInfo(id);

          return { nbCleanedLines, gameInfo };
        });

        if (nbCleanedLines > 0) {
          for (const p of game.players.values()) {
            const gameScore = game.getScore(nbCleanedLines);
            if (p != player && p.alive) {
              const targetGameInfo = await p.applyPenality(game, nbCleanedLines);
              if (gameScore) {
                targetGameInfo.gameScore = gameScore;
                player.score += gameScore.score;
              }
              io.to(p.user.id).emit(EVENT_GAME_PENALITY, targetGameInfo);
            }
          }
        }

        if (player.checkLost()) {
          io.to(id).emit(EVENT_GAME_INFO, gameInfo);
        } else {
          setDeadPlayer(io, game, player);
        }
      } else {
        setDeadPlayer(io, game, player);
      }
    }

    io.to(room.name).emit(EVENT_GAME_SPECTRUM, game.getGameSpectrums());
    game.checkFinished();
    await sleep(game.settings.tick);
  }

  const lastPlayer = game.players.values().find((p) => p.alive);
  if (lastPlayer) {
    setDeadPlayer(io, game, lastPlayer);
  }

  io.to(room.name).emit(EVENT_GAME_FINISH, game.getFinalScore());
  room.game = null;
  io.to(room.name).emit(EVENT_ROOM_UPDATE, room.asInfo());
}

export async function warmUpLoop(io: AppServer, user: User) {
  const game = user.warmUp;
  if (!game) throw new Error("Game not prepared!");

  game.ongoing = true;
  io.to(user.id).emit(EVENT_WARMUP_INFO, game.getGameInfo(user.id));

  while (game.ongoing) {
    for (const [id, player] of game.players) {
      const { nbCleanedLines, gameInfo } = await player.mutex.runExclusive(() => {
        if (player.isNextPositionValid()) {
          player.actualPiece.moveDown();
        } else {
          player.attachCurrentPiece(game);
        }
        const nbCleanedLines = player.board.cleanLines(game.settings.destructiblePenality);
        const gameInfo = game.getGameInfo(id);

        return { nbCleanedLines, gameInfo };
      });

      const gameScore = game.getScore(nbCleanedLines);
      player.checkLost();

      if (gameScore) {
        player.score += gameScore.score;
        gameInfo.gameScore = gameScore;
      }

      io.to(id).emit(EVENT_WARMUP_INFO, gameInfo);
    }

    game.checkFinished();
    await sleep(game.settings.tick);
  }

  io.to(user.id).emit(EVENT_WARMUP_FINISH);
  user.warmUp = null;
}
