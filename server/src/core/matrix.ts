import type { Piece } from "@app/objects/Piece";

export function placePieceOnMatrix(piece: Piece, matrix: number[][]) {
  for (const [x, y] of piece.blocks) {
    const row = piece.x + x;
    const column = piece.y + y;

    const matrixRow = matrix[row];
    if (!matrixRow) throw Error("Invalid row index!");

    matrixRow[column] = piece.color;
  }
}
