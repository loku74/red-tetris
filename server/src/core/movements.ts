import type { GameActions } from "@app/shared";
import type { Game } from "../objects/Game";
import type { Player } from "../objects/Player";
import type { ActionData } from "../types/server";

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

export function applyMovement(game: Game, player: Player, key: keyof typeof actions): boolean {
  if (!player.alive) return false;
  if (!game.ongoing) return false;

  const next = player.actualPiece.clone();

  actions[key]({ piece: next, board: player.board } as ActionData);

  if (player.board.isValidPiece(next)) {
    player.actualPiece = next;
    return true;
  }
  return false;
}
