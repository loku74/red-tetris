// types
import type { Game } from "../objects/Game";
import type { Player } from "../objects/Player";
import type { ActionData } from "../types/server";
import type { AppServer } from "../types/socket";

// intern
import { helpers } from "./game";
import { GameActions } from "@app/shared";

const actions: Record<GameActions, (data: ActionData) => void> = {
  UP: (data: ActionData) => data.piece.rotate90(),
  LEFT: (data: ActionData) => data.piece.moveLeft(),
  RIGHT: (data: ActionData) => data.piece.moveRight(),
  DOWN: (data: ActionData) => data.piece.moveDown(),
  SPACE: (data: ActionData) => {
    while (data.board.isValidPiece(data.piece.clone().moveDown())) {
      data.piece.moveDown();
    }
  }
};

export function applyMovement(
  io: AppServer,
  game: Game,
  player: Player,
  key: keyof typeof actions
) {
  if (!player.alive) return;
  if (!game.ongoing) return;

  const actualPiece = player.actualPiece.clone();

  const actionData: ActionData = { piece: actualPiece, board: player.board };
  actions[key](actionData);

  if (player.board.isValidPiece(actualPiece)) {
    player.actualPiece = actualPiece;

    // hard drop
    if (key === GameActions.SPACE) {
      helpers.attachCurrentPiece(game, player, io);
    }
  }
}
