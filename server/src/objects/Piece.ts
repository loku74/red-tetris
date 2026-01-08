export class Piece {
  public rotation: number = 0;

  constructor(
    public name: string,
    public matrix: number[][] // row, column
  ) {}

  private addRotation() {
    this.rotation = (this.rotation + 1) % 4;
  }

  public rotate90(nb: number = 1): Piece {
    if (nb < 1) throw new Error("Invalid rotation index!");
    if (nb > 3) throw new Error("Too much rotations!");

    for (let i = 0; i < nb; i++) {
      if (!this.matrix.length || !this.matrix[0]) return this;

      /**
       * clockwise rotation:
       * iterate over each column, then
       * replace each row by the actual reversed column
       * (each new row is a column of the original matrix
       * readed from bottom to top)
       */
      const newMatrix = this.matrix[0].map((_, index) =>
        this.matrix
          .map((row) => {
            if (row[index] === undefined) throw new Error("Matrix must be rectangular!");
            return row[index];
          })
          .reverse()
      );

      this.matrix = newMatrix;
      this.addRotation();
    }

    return this;
  }

  // for debugging
  public toString(): string | undefined {
    for (const row of this.matrix) {
      return row.map((cell) => cell.toString()).join("");
    }
  }
}
