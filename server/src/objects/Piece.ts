// intern
import { Colors, PIECES } from "@app/shared";

// types
import type { Matrix2D, PieceType, PieceData } from "@app/shared";
import { asMatrix } from "../core/matrix";

export class Piece {
  public rotation: number = 0;
  public alreadyMoved: boolean = false;
  public matrix: Matrix2D<number>; // row, column
  public color: Colors;

  constructor(
    public type: PieceType,
    public x: number = 0,
    public y: number = 0
  ) {
    ({ matrix: this.matrix, color: this.color } = PIECES[type]);
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
    const { type, matrix, x, y, rotation, alreadyMoved } = structuredClone(this);
    const copy = new Piece(type, x, y);

    copy.matrix = matrix;
    copy.rotation = rotation;
    copy.alreadyMoved = alreadyMoved;
    return copy;
  }

  public asData(): PieceData {
    return {
      matrix: this.matrix,
      x: this.x,
      y: this.y,
      color: this.color
    };
  }
}
