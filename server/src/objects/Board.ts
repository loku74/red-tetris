import { Colors, type Matrix2D, type NonEmptyArray } from "@app/shared";
import { Piece } from "./Piece";
import { BOARD } from "../constants/board";
import { placePieceOnMatrix } from "../core/matrix";

export class Board {
  public matrix: Matrix2D<number>; // row, column
  public restrictedLines: number = 0;
  public placedPieces: number = 0;

  constructor() {
    // fill grid with 0;
    this.matrix = structuredClone(BOARD);
  }

  private getRow(index: number): NonEmptyArray<number> {
    const result = this.matrix[index];
    if (!result) throw new Error("Invalid row index!");
    return result;
  }

  public isValidPiece(piece: Piece): boolean {
    // this check if a piece is does not have conflict
    // with others pieces / walls / restricted lines
    // useful to detect if a movement is valid or if a piece reach the bottom
    if (!piece.matrix[0]) throw new Error("Invalid piece matrix!");

    return piece.matrix.every((pieceRow, i) => {
      return pieceRow.every((pieceCell, j) => {
        if (pieceCell != 0) {
          const boardRow = this.matrix[piece.x + i];
          // outside of board
          if (!boardRow) return false;
          const boardCell = boardRow[piece.y + j];
          // outside of board or colisision
          if (boardCell === undefined || boardCell != 0) return false;
        }
        return true;
      });
    });
  }

  public place(piece: Piece) {
    if (!this.isValidPiece(piece)) {
      throw new Error("Invalid placement");
    }

    placePieceOnMatrix(piece, this.matrix);
    this.placedPieces++;
  }

  public cleanLines(): number {
    const start = this.matrix.length - this.restrictedLines - 1;
    let cleared = 0;

    // iterate from bottom to top
    for (let rowIndex = start; rowIndex >= 0; rowIndex--) {
      const row = this.getRow(rowIndex);

      const toClear = row.every((v) => v != 0);
      if (toClear) {
        cleared++;
        // push down every lines upper to the line cleared
        for (let k = rowIndex; k >= 1; k--) {
          const rowBefore = this.getRow(k - 1);
          const rowActual = this.getRow(k);

          rowActual.forEach((_, j) => {
            if (rowBefore[j] === undefined) throw new Error("Invalid column index!");
            rowActual[j] = rowBefore[j];
          });
        }
        this.matrix[0].fill(0);
        rowIndex++;
      }
    }
    return cleared;
  }

  public addRestrictedLine() {
    const row = this.getRow(this.restrictedLines);
    row.forEach((_, i) => {
      row[i] = Colors.GREY;
    });
    this.restrictedLines++;
  }
}
