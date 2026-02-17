import type { Piece } from "@app/objects/Piece";

export function placePieceOnMatrix(piece: Piece, matrix: number[][]) {
  piece.blocks.forEach(([x, y]) => {
    const row = piece.x + x;
    const column = piece.y + y;

    const matrixRow = matrix[row];
    if (!matrixRow) throw Error("Invalid row index!");

    matrixRow[column] = piece.color;
  });
}
