import type { Matrix2D } from "@app/shared";

import type { Piece } from "@app/objects/Piece";

export function placePieceOnMatrix(piece: Piece, matrix: Matrix2D<number>) {
  piece.blocks.forEach(([x, y]) => {
    const row = piece.x + x;
    const column = piece.y + y;

    const matrixRow = matrix[row];
    if (!matrixRow) throw Error("Invalid row index!");

    matrixRow[column] = piece.color;
  });
}
