import { GameActions } from "@app/shared";

import { MAX_ROTATIONS } from "@app/constants/core";
import { PIECES } from "@app/constants/pieces";
import { Rotations } from "@app/enums/Rotations";
import type { Game } from "@app/objects/Game";
import type { Piece } from "@app/objects/Piece";
import type { Player } from "@app/objects/Player";
import type { ActionData } from "@app/types/server";

function superRotationSystem(data: ActionData): Piece {
  const offsets = PIECES[data.piece.type].offsets;
  const currentRotation: Rotations = data.piece.rotation;
  const nextRotation: Rotations = (data.piece.rotation + 1) % MAX_ROTATIONS;

  for (let i = 0; i < MAX_ROTATIONS + 1; i++) {
    const currentRotationOffset = offsets[currentRotation][i];
    const nextRotationOffset = offsets[nextRotation][i];

    if (currentRotationOffset != undefined && nextRotationOffset != undefined) {
      const moveX = currentRotationOffset[0] - nextRotationOffset[0];
      const moveY = currentRotationOffset[1] - nextRotationOffset[1];

      const copy = data.piece.clone();
      copy.rotate90();
      copy.x += moveX;
      copy.y += moveY;

      if (data.board.isValidPiece(copy)) {
        return copy;
      }
    }
  }
  return data.piece;
}

const actions: Record<GameActions, (data: ActionData) => Piece> = {
  UP: (data: ActionData) => superRotationSystem(data),
  LEFT: (data: ActionData) => data.piece.moveLeft(),
  RIGHT: (data: ActionData) => data.piece.moveRight(),
  DOWN: (data: ActionData) => data.piece.moveDown(),
  SPACE: (data: ActionData) => {
    while (data.board.isValidPiece(data.piece.clone().moveDown())) {
      data.piece.moveDown();
    }
    return data.piece;
  }
};

export async function applyMovement(game: Game, player: Player, key: keyof typeof actions) {
  if (!player.alive) return 0;
  if (!game.ongoing) return 0;
  let result = 0;

  await player.mutex.runExclusive(() => {
    const actionData: ActionData = { piece: player.actualPiece.clone(), board: player.board };
    const movedPiece = actions[key](actionData);

    if (player.board.isValidPiece(movedPiece)) {
      player.actualPiece = movedPiece;

      // hard drop
      if (key === GameActions.SPACE) {
        player.attachCurrentPiece(game);

        result = player.board.cleanLines(game.settings.destructiblePenality);
      }
    }
  });

  return result;
}
