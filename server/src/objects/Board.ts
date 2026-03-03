import { BOARD_HEIGHT, BOARD_WIDTH, PieceColor } from "@app/shared";

import { placePieceOnMatrix } from "@app/core/matrix";

import { Piece } from "./Piece";

export class Board {
  public matrix: number[][]; // row, column
  public playableLines: number = BOARD_HEIGHT - 1;
  public placedPieces: number = 0;
  public completedRowIndices: Set<number> = new Set();

  constructor() {
    this.matrix = Array.from({ length: BOARD_HEIGHT }, () =>
      Array(BOARD_WIDTH).fill(PieceColor.EMPTY)
    );
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
      if (boardCell === undefined || boardCell != PieceColor.EMPTY) return false;
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
      if (row.every((cell) => cell != PieceColor.EMPTY)) {
        this.completedRowIndices.add(indice);
      }
    });
  }

  public cleanLines(destructible: boolean): number {
    const size = this.completedRowIndices.size;

    this.completedRowIndices.forEach((row_i) => {
      this.matrix.splice(row_i, 1);
      this.matrix.unshift(Array(BOARD_WIDTH).fill(PieceColor.EMPTY));
    });
    this.completedRowIndices.clear();

    if (destructible) {
      this.removeRestrictedLines(size);
    }
    return size;
  }

  public addRestrictedLines(nb: number) {
    for (let i = 0; i < nb - 1; i++) {
      if (this.playableLines < 0) return;

      const row = this.getRow(this.playableLines);
      row.forEach((_, col) => {
        row[col] = PieceColor.GREY;
      });
      this.playableLines--;
    }
  }

  public removeRestrictedLines(nb: number) {
    for (let i = 0; i < nb - 1; i++) {
      if (this.playableLines === BOARD_HEIGHT - 1) return;

      this.matrix.splice(BOARD_HEIGHT - 1, 1);
      this.matrix.unshift(Array(BOARD_WIDTH).fill(PieceColor.EMPTY));
      this.playableLines++;
    }
  }
}
