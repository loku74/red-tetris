import { Colors } from "@app/shared";

import { BOARD_HEIGHT, BOARD_WIDTH } from "@app/constants/core";
import { placePieceOnMatrix } from "@app/core/matrix";

import { Piece } from "./Piece";

export class Board {
  public matrix: number[][]; // row, column
  public restrictedLines: number = 0;
  public placedPieces: number = 0;
  public completedRowIndices: Set<number> = new Set();

  constructor() {
    this.matrix = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(Colors.EMPTY));
  }

  private getRow(index: number): number[] {
    const result = this.matrix[index];
    if (!result) throw new Error("Invalid row index!");
    return result;
  }

  public isValidPiece(piece: Piece): boolean {
    // this check if a piece is does not have conflict
    // with others pieces / walls / restricted lines
    // useful to detect if a movement is valid or if a piece reach the bottom
    for (const [x, y] of piece.blocks) {
      const row = piece.x + x;
      const column = piece.y + y;
      const boardRow = this.matrix[row];

      if (boardRow === undefined) return false;
      const boardCell = boardRow[column];
      if (boardCell === undefined || boardCell != Colors.EMPTY) return false;
    }
    return true;
  }

  public place(piece: Piece) {
    if (!this.isValidPiece(piece)) {
      throw new Error("Invalid placement");
    }

    placePieceOnMatrix(piece, this.matrix);
    this.placedPieces++;

    // check lines to clear
    piece.blocks.forEach(([x]) => {
      const indice = piece.x + x;
      const row = this.matrix[indice];
      if (!row) return;
      if (row.every((cell) => cell != Colors.EMPTY)) {
        this.completedRowIndices.add(indice);
      }
    });
  }

  public cleanLines(): number {
    const size = this.completedRowIndices.size;

    this.completedRowIndices.forEach((row_i) => {
      this.matrix.splice(row_i, 1);
      this.matrix.unshift(Array(BOARD_WIDTH).fill(Colors.EMPTY));
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
