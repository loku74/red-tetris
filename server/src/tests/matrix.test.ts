import { describe, expect, it } from "vitest";
import { Piece } from "../objects/Piece";
import { PIECES, PieceType } from "@app/shared";

describe("matrix rotations", () => {
  it("invalid rotations", () => {
    expect(() => new Piece(PieceType.I).rotate90(0)).toThrowError();
    expect(() => new Piece(PieceType.I).rotate90(-1)).toThrowError();
    expect(() => new Piece(PieceType.I).rotate90(4)).toThrowError();
  });

  it("I", () => {
    const rotationA = new Piece(PieceType.I).rotate90(1);
    const rotationB = new Piece(PieceType.I).rotate90(2);
    const rotationC = new Piece(PieceType.I).rotate90(3);
    expect(rotationA.matrix).toEqual([
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0]
    ]);
    expect(rotationB.matrix).toEqual([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0]
    ]);
    expect(rotationC.matrix).toEqual([
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ]);
  });

  it("J", () => {
    const rotationA = new Piece(PieceType.J).rotate90(1);
    const rotationB = new Piece(PieceType.J).rotate90(2);
    const rotationC = new Piece(PieceType.J).rotate90(3);
    expect(rotationA.matrix).toEqual([
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0]
    ]);
    expect(rotationB.matrix).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1]
    ]);
    expect(rotationC.matrix).toEqual([
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0]
    ]);
  });

  it("L", () => {
    const rotationA = new Piece(PieceType.L).rotate90(1);
    const rotationB = new Piece(PieceType.L).rotate90(2);
    const rotationC = new Piece(PieceType.L).rotate90(3);
    expect(rotationA.matrix).toEqual([
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1]
    ]);
    expect(rotationB.matrix).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0]
    ]);
    expect(rotationC.matrix).toEqual([
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0]
    ]);
  });

  it("O", () => {
    const rotationA = new Piece(PieceType.O).rotate90(1);
    const rotationB = new Piece(PieceType.O).rotate90(2);
    const rotationC = new Piece(PieceType.O).rotate90(3);
    expect(rotationA.matrix).toEqual(PIECES.O.matrix);
    expect(rotationB.matrix).toEqual(PIECES.O.matrix);
    expect(rotationC.matrix).toEqual(PIECES.O.matrix);
  });

  it("S", () => {
    const rotationA = new Piece(PieceType.S).rotate90(1);
    const rotationB = new Piece(PieceType.S).rotate90(2);
    const rotationC = new Piece(PieceType.S).rotate90(3);
    expect(rotationA.matrix).toEqual([
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1]
    ]);
    expect(rotationB.matrix).toEqual([
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0]
    ]);
    expect(rotationC.matrix).toEqual([
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0]
    ]);
  });

  it("T", () => {
    const rotationA = new Piece(PieceType.T).rotate90(1);
    const rotationB = new Piece(PieceType.T).rotate90(2);
    const rotationC = new Piece(PieceType.T).rotate90(3);
    expect(rotationA.matrix).toEqual([
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0]
    ]);
    expect(rotationB.matrix).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0]
    ]);
    expect(rotationC.matrix).toEqual([
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0]
    ]);
  });

  it("Z", () => {
    const rotationA = new Piece(PieceType.Z).rotate90(1);
    const rotationB = new Piece(PieceType.Z).rotate90(2);
    const rotationC = new Piece(PieceType.Z).rotate90(3);
    expect(rotationA.matrix).toEqual([
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0]
    ]);
    expect(rotationB.matrix).toEqual([
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1]
    ]);
    expect(rotationC.matrix).toEqual([
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0]
    ]);
  });
});
