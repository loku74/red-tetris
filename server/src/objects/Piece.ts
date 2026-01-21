import { asMatrix } from "../core/piece";
import type { Matrix2D, PieceType, PieceColor } from "@app/shared";

export class Piece {
  public rotation: number = 0;
  public alreadyMoved: boolean = false;

  constructor(
    public type: PieceType,
    public matrix: Matrix2D<number>, // row, column
    public x: number = 0,
    public y: number = 0,
    public color: PieceColor = "grey"
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

    this.alreadyMoved = true;
    for (let i = 0; i < nb; i++) {
      /**
       * clockwise rotation:
       * iterate over each column, then
       * replace each row by the actual reversed column
       * (each new row is a column of the original matrix
       * readed from bottom to top)
       */
      const newRows = this.matrix[0].map((_, index) =>
        this.matrix.map((row) => row[index]).reverse()
      );

      this.matrix = asMatrix(newRows);
      this.addRotation();
    }

    return this;
  }

  public moveDown(): Piece {
    this.alreadyMoved = true;
    this.x++;
    return this;
  }

  public moveLeft(): Piece {
    this.alreadyMoved = true;
    this.y--;
    return this;
  }

  public moveRight(): Piece {
    this.alreadyMoved = true;
    this.y++;
    return this;
  }

  public clone(): Piece {
    const { type, matrix, x, y, color, rotation, alreadyMoved } = structuredClone(this);
    const copy = new Piece(type, matrix, x, y, color);
    copy.rotation = rotation;
    copy.alreadyMoved = alreadyMoved;
    return copy;
  }
}
