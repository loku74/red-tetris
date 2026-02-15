import { Colors, type Matrix2D, type NonEmptyArray } from "@app/shared";

import { BOARD } from "@app/constants/board";
import { placePieceOnMatrix } from "@app/core/matrix";

import { Piece } from "./Piece";

export class Board {
  public matrix: Matrix2D<number>; // row, column
  public restrictedLines: number = 0;
  public placedPieces: number = 0;
  public completedRowIndices: Set<number> = new Set();

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

    // check lines to clear
    piece.matrix
      .map((_, offset) => piece.x + offset)
      .forEach((i) => {
        const row = this.matrix[i];

        if (!row) return;
        if (row.every((cell) => cell != Colors.EMPTY)) {
          this.completedRowIndices.add(i);
        }
      });
  }

  public cleanLines(): number {
    const size = this.completedRowIndices.size;

    this.completedRowIndices.forEach((row_i) => {
      this.matrix.splice(row_i, 1);
      this.matrix.unshift(structuredClone(BOARD[0]));
    });
    this.completedRowIndices.clear();
    return size;
  }

  public addRestrictedLine() {
    const row = this.getRow(this.restrictedLines);
    row.forEach((_, i) => {
      row[i] = Colors.GREY;
    });
    this.restrictedLines++;
  }
}
