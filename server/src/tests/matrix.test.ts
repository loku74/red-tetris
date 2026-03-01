import { describe, expect, it } from "vitest";

import { PieceColor, PieceShape } from "@app/shared";

import { PIECES } from "@app/constants/pieces";
import { Piece } from "@app/objects/Piece";

const C = PieceColor.CYAN;
const B = PieceColor.BLUE;
const O = PieceColor.ORANGE;
const G = PieceColor.GREEN;
const P = PieceColor.PURPLE;
const R = PieceColor.RED;

describe("toGrid() rotations", () => {
  it("invalid rotations", () => {
    expect(() => new Piece(PieceShape.I).rotate90(0)).toThrowError();
    expect(() => new Piece(PieceShape.I).rotate90(-1)).toThrowError();
    expect(() => new Piece(PieceShape.I).rotate90(4)).toThrowError();
  });

  it(PieceShape.I, () => {
    const rotationA = new Piece(PieceShape.I).rotate90(1);
    const rotationB = new Piece(PieceShape.I).rotate90(2);
    const rotationC = new Piece(PieceShape.I).rotate90(3);
    expect(rotationA.toGrid()).toEqual([
      [C, 0, 0, 0],
      [C, 0, 0, 0],
      [C, 0, 0, 0],
      [C, 0, 0, 0]
    ]);
    expect(rotationB.toGrid()).toEqual([
      [C, C, C, C],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]);
    expect(rotationC.toGrid()).toEqual([
      [C, 0, 0, 0],
      [C, 0, 0, 0],
      [C, 0, 0, 0],
      [C, 0, 0, 0]
    ]);
  });

  it(PieceShape.J, () => {
    const rotationA = new Piece(PieceShape.J).rotate90(1);
    const rotationB = new Piece(PieceShape.J).rotate90(2);
    const rotationC = new Piece(PieceShape.J).rotate90(3);
    expect(rotationA.toGrid()).toEqual([
      [B, B, 0],
      [B, 0, 0],
      [B, 0, 0]
    ]);
    expect(rotationB.toGrid()).toEqual([
      [B, B, B],
      [0, 0, B],
      [0, 0, 0]
    ]);
    expect(rotationC.toGrid()).toEqual([
      [0, B, 0],
      [0, B, 0],
      [B, B, 0]
    ]);
  });

  it(PieceShape.L, () => {
    const rotationA = new Piece(PieceShape.L).rotate90(1);
    const rotationB = new Piece(PieceShape.L).rotate90(2);
    const rotationC = new Piece(PieceShape.L).rotate90(3);
    expect(rotationA.toGrid()).toEqual([
      [O, 0, 0],
      [O, 0, 0],
      [O, O, 0]
    ]);
    expect(rotationB.toGrid()).toEqual([
      [O, O, O],
      [O, 0, 0],
      [0, 0, 0]
    ]);
    expect(rotationC.toGrid()).toEqual([
      [O, O, 0],
      [0, O, 0],
      [0, O, 0]
    ]);
  });

  it(PieceShape.O, () => {
    const rotationA = new Piece(PieceShape.O).rotate90(1);
    const rotationB = new Piece(PieceShape.O).rotate90(2);
    const rotationC = new Piece(PieceShape.O).rotate90(3);
    expect(rotationA.blocks).toEqual(PIECES.O.blocks);
    expect(rotationB.blocks).toEqual(PIECES.O.blocks);
    expect(rotationC.blocks).toEqual(PIECES.O.blocks);
  });

  it(PieceShape.S, () => {
    const rotationA = new Piece(PieceShape.S).rotate90(1);
    const rotationB = new Piece(PieceShape.S).rotate90(2);
    const rotationC = new Piece(PieceShape.S).rotate90(3);
    expect(rotationA.toGrid()).toEqual([
      [G, 0, 0],
      [G, G, 0],
      [0, G, 0]
    ]);
    expect(rotationB.toGrid()).toEqual([
      [0, G, G],
      [G, G, 0],
      [0, 0, 0]
    ]);
    expect(rotationC.toGrid()).toEqual([
      [G, 0, 0],
      [G, G, 0],
      [0, G, 0]
    ]);
  });

  it(PieceShape.T, () => {
    const rotationA = new Piece(PieceShape.T).rotate90(1);
    const rotationB = new Piece(PieceShape.T).rotate90(2);
    const rotationC = new Piece(PieceShape.T).rotate90(3);
    expect(rotationA.toGrid()).toEqual([
      [P, 0, 0],
      [P, P, 0],
      [P, 0, 0]
    ]);
    expect(rotationB.toGrid()).toEqual([
      [P, P, P],
      [0, P, 0],
      [0, 0, 0]
    ]);
    expect(rotationC.toGrid()).toEqual([
      [0, P, 0],
      [P, P, 0],
      [0, P, 0]
    ]);
  });

  it(PieceShape.Z, () => {
    const rotationA = new Piece(PieceShape.Z).rotate90(1);
    const rotationB = new Piece(PieceShape.Z).rotate90(2);
    const rotationC = new Piece(PieceShape.Z).rotate90(3);
    expect(rotationA.toGrid()).toEqual([
      [0, R, 0],
      [R, R, 0],
      [R, 0, 0]
    ]);
    expect(rotationB.toGrid()).toEqual([
      [R, R, 0],
      [0, R, R],
      [0, 0, 0]
    ]);
    expect(rotationC.toGrid()).toEqual([
      [0, R, 0],
      [R, R, 0],
      [R, 0, 0]
    ]);
  });
});
