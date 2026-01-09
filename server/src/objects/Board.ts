import type { Matrix2D, NonEmptyArray } from "../types/types";
import { Piece } from "./Piece";

export class Board {
  public matrix: Matrix2D<number>; // row, column
  public restrictedLines: number = 0;

  constructor(width: number, height: number) {
    if (width < 1 || height < 1) throw Error("Invalid board dimensions!");

    // fill grid with 0;
    const grid: number[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => 0)
    );

    this.matrix = grid as Matrix2D<number>;
  }

  private getRow(index: number) : NonEmptyArray<number> {
    const result = this.matrix[index];
    if (!result) throw new Error("Invalid row index!");
    return result;
  }

  public isValidPlacement(piece: Piece, x: number, y: number): boolean {
    if (!piece.matrix[0]) throw new Error("Invalid piece matrix!");

    const pieceHeight = piece.matrix.length;
    const pieceWidth = piece.matrix[0].length;

    if (
      x < 0 || y < 0
    ) {
      return false;
    }

    for (let i = 0; i < pieceHeight; i++) {
      for (let j = 0; j < pieceWidth; j++) {
        const row = piece.matrix[i];
        if (!row) return false;
        const cell = row[j];
        if (cell === undefined) return false;

        if (cell === 1) {
          const boardRow = this.matrix[x + i];
          if (!boardRow) return false;
          const boardCell = boardRow[y + j];
          if (boardCell === undefined || boardCell === 1) return false;
        }
      }
    }
    return true;
  }

  public place(piece: Piece, x: number, y: number) {
    if (!this.isValidPlacement(piece, x, y)) {
      throw new Error("Invalid placement");
    }

    piece.matrix.forEach((pieceRow, i) => {
      const boardRow = this.getRow(x + i);

      pieceRow.forEach((cell, j) => {
        boardRow[y + j] = cell;
      });
    });
  }

  public cleanLines(): number {
    const start = this.matrix.length - this.restrictedLines - 1;
    let lines = 0;

    // iterate from bottom to top
    for (let rowIndex = start; rowIndex >= 0; rowIndex--) {
      const row = this.getRow(rowIndex);
  
      const toClear = row.every((v) => v === 1);
      if (toClear) {
        lines++;
        // push down every lines upper to the line cleared
        for (let k = rowIndex; k >= 1; k--) {
          const rowBefore = this.getRow(k - 1);
          const rowActual = this.getRow(k);

          rowActual.forEach((_, j) => {
            if (rowBefore[j] === undefined) throw new Error("Invalid column index!");
            rowActual[j] = rowBefore[j];
          })
        }
        this.matrix[0].fill(0);
        rowIndex++;
      }
    }
    return lines;
  }
}
