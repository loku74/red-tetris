import type { Matrix2D, NonEmptyArray } from "@app/shared";
import type { Piece } from "../objects/Piece";

export function asMatrix(data: (number | undefined)[][]): Matrix2D<number> {
  const rows: NonEmptyArray<number>[] = data.map((row) => {
    const checked: number[] = row.map((cell) => {
      if (cell === undefined) throw new Error("Cell cannot be undefined!");
      return cell;
    });
    const [first, ...others] = checked;
    if (first === undefined) throw new Error("Cell cannot be undefined!");

    return [first, ...others];
  });
  const [first, ...others] = rows;
  if (first === undefined) throw new Error("Row cannot be undefined!");

  return [first, ...others];
}

export function placePieceOnMatrix(piece: Piece, matrix: Matrix2D<number>) {
  piece.matrix.forEach((pieceRow, i) => {
    // we skip empty piece lines
    if (!pieceRow.find((v) => v === 1)) return;
    const matrixRow = matrix[piece.x + i];
    if (!matrixRow) throw Error("Invalid row index!");

    pieceRow.forEach((cell, j) => {
      // skip zeros
      if (!cell) return;
      matrixRow[piece.y + j] = piece.color;
    });
  });
}
