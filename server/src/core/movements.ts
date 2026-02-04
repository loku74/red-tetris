import type { Game } from "../objects/Game";
import type { Player } from "../objects/Player";
import type { ActionData } from "../types/server";

export const actions = {
  Rotate: (data: ActionData) => data.piece.rotate90(),
  Left: (data: ActionData) => data.piece.moveLeft(),
  Right: (data: ActionData) => data.piece.moveRight(),
  Down: (data: ActionData) => data.piece.moveDown(),
  DropDown: (data: ActionData) => {
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
