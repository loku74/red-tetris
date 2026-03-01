import type { Coordinate, PieceData, PieceShape } from "@app/shared";
import { PieceColor } from "@app/shared";

import { MAX_ROTATIONS } from "@app/constants/core";
import { PIECES } from "@app/constants/pieces";
import { Rotations } from "@app/enums/Rotations";

export class Piece {
  public rotation: Rotations = Rotations.SPAWN;
  public alreadyMoved: boolean = false;
  public blocks: Coordinate[]; // row, column
  public color: PieceColor;

  constructor(
    public type: PieceShape,
    public x: number = 0,
    public y: number = 0
  ) {
    const piece = PIECES[type];

    this.blocks = structuredClone(piece.blocks);
    this.color = piece.color;
  }

  private addRotation() {
    this.rotation = (this.rotation + 1) % MAX_ROTATIONS;
  }

  public rotate90(nb: number = 1): Piece {
    if (nb < 1) throw new Error("Invalid rotation index!");
    if (nb > 3) throw new Error("Too much rotations!");
    if (this.type === "O") return this;

    this.alreadyMoved = true;
    for (let i = 0; i < nb; i++) {
      this.addRotation();

      this.blocks.forEach((block) => {
        const oldX = block[0];
        const oldY = block[1];
        block[0] = oldY;
        block[1] = -oldX;
      });
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
    const { type, blocks, x, y, rotation, alreadyMoved } = structuredClone(this);
    const copy = new Piece(type, x, y);

    copy.blocks = blocks;
    copy.rotation = rotation;
    copy.alreadyMoved = alreadyMoved;
    return copy;
  }

  public toGrid(): number[][] {
    const minX = Math.min(...this.blocks.map((b) => b[0]));
    const minY = Math.min(...this.blocks.map((b) => b[1]));

    const size = this.blocks.reduce((acc, [x, y]) => Math.max(acc, x - minX + 1, y - minY + 1), 0);

    const grid = Array.from({ length: size }, () => Array(size).fill(PieceColor.EMPTY));

    this.blocks.forEach(([x, y]) => {
      const row = grid[x - minX];

      if (row != undefined) {
        row[y - minY] = this.color;
      }
    });

    return grid;
  }

  public asData(): PieceData {
    return {
      matrix: this.toGrid(),
      x: this.x,
      y: this.y,
      color: this.color
    };
  }

  public asSpectrum() {
    const fixedBlocks = structuredClone(this.blocks);

    fixedBlocks.forEach((b) => {
      b[0] += this.x;
      b[1] += this.y;
    });
    return {
      color: this.color,
      blocks: fixedBlocks
    };
  }
}
