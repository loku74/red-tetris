import type { Matrix2D, PieceType } from "../types/types";

export class Piece {
  public rotation: number = 0;

  constructor(
    public type: PieceType,
    public matrix: Matrix2D<number> // row, column
  ) {
    const width = matrix[0].length;
    for (const row of matrix) {
      if (row.length != width) throw new Error("Matrix must be rectangular!");
    }
  }

  private addRotation() {
    this.rotation = (this.rotation + 1) % 4;
  }

  public rotate90(nb: number = 1): Piece {
    if (nb < 1) throw new Error("Invalid rotation index!");
    if (nb > 3) throw new Error("Too much rotations!");
    if (this.type === "O") return this;

    for (let i = 0; i < nb; i++) {
      /**
       * clockwise rotation:
       * iterate over each column, then
       * replace each row by the actual reversed column
       * (each new row is a column of the original matrix
       * readed from bottom to top)
       */
      const newMatrix = this.matrix[0].map((_, index) =>
        this.matrix.map((row) => row[index]).reverse()
      ) as Matrix2D<number>;

      this.matrix = newMatrix;
      this.addRotation();
    }

    return this;
  }
}
