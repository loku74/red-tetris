import { describe, expect, it } from "vitest";
import { Piece } from "../objects/Piece";
import { PIECES } from "../constants/pieces";

it("non rectangular matrix", () => {
  const matrix: number[][] = [
    [1, 0, 1],
    [1, 0]
  ];

  expect(() => new Piece("I", matrix).rotate90(1)).toThrowError();
});

describe("matrix rotations", () => {
  it("invalid rotations", () => {
    expect(() => new Piece("I", PIECES.I).rotate90(0)).toThrowError();
    expect(() => new Piece("I", PIECES.I).rotate90(-1)).toThrowError();
    expect(() => new Piece("I", PIECES.I).rotate90(4)).toThrowError();
  });

  it("I", () => {
    const rotationA = new Piece("I", PIECES.I).rotate90(1);
    const rotationB = new Piece("I", PIECES.I).rotate90(2);
    const rotationC = new Piece("I", PIECES.I).rotate90(3);
    expect(rotationA.matrix).toEqual([[1], [1], [1], [1]]);
    expect(rotationB.matrix).toEqual([[1, 1, 1, 1]]);
    expect(rotationC.matrix).toEqual([[1], [1], [1], [1]]);
  });

  it("J", () => {
    const rotationA = new Piece("J", PIECES.J).rotate90(1);
    const rotationB = new Piece("J", PIECES.J).rotate90(2);
    const rotationC = new Piece("J", PIECES.J).rotate90(3);
    expect(rotationA.matrix).toEqual([
      [1, 1],
      [1, 0],
      [1, 0]
    ]);
    expect(rotationB.matrix).toEqual([
      [1, 1, 1],
      [0, 0, 1]
    ]);
    expect(rotationC.matrix).toEqual([
      [0, 1],
      [0, 1],
      [1, 1]
    ]);
  });

  it("L", () => {
    const rotationA = new Piece("L", PIECES.L).rotate90(1);
    const rotationB = new Piece("L", PIECES.L).rotate90(2);
    const rotationC = new Piece("L", PIECES.L).rotate90(3);
    expect(rotationA.matrix).toEqual([
      [1, 0],
      [1, 0],
      [1, 1]
    ]);
    expect(rotationB.matrix).toEqual([
      [1, 1, 1],
      [1, 0, 0]
    ]);
    expect(rotationC.matrix).toEqual([
      [1, 1],
      [0, 1],
      [0, 1]
    ]);
  });

  it("O", () => {
    const rotationA = new Piece("O", PIECES.O).rotate90(3);
    const rotationB = new Piece("O", PIECES.O).rotate90(3);
    const rotationC = new Piece("O", PIECES.O).rotate90(3);
    expect(rotationA.matrix).toEqual(PIECES.O);
    expect(rotationB.matrix).toEqual(PIECES.O);
    expect(rotationC.matrix).toEqual(PIECES.O);
  });

  it("Z", () => {
    const rotationA = new Piece("Z", PIECES.Z).rotate90(1);
    const rotationB = new Piece("Z", PIECES.Z).rotate90(2);
    const rotationC = new Piece("Z", PIECES.Z).rotate90(3);
    expect(rotationA.matrix).toEqual([
      [1, 0],
      [1, 1],
      [0, 1]
    ]);
    expect(rotationB.matrix).toEqual([
      [0, 1, 1],
      [1, 1, 0]
    ]);
    expect(rotationC.matrix).toEqual([
      [1, 0],
      [1, 1],
      [0, 1]
    ]);
  });

  it("T", () => {
    const rotationA = new Piece("T", PIECES.T).rotate90(1);
    const rotationB = new Piece("T", PIECES.T).rotate90(2);
    const rotationC = new Piece("T", PIECES.T).rotate90(3);
    expect(rotationA.matrix).toEqual([
      [1, 0],
      [1, 1],
      [1, 0]
    ]);
    expect(rotationB.matrix).toEqual([
      [1, 1, 1],
      [0, 1, 0]
    ]);
    expect(rotationC.matrix).toEqual([
      [0, 1],
      [1, 1],
      [0, 1]
    ]);
  });
});
