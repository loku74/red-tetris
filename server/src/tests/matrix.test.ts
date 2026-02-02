import { describe, expect, it } from "vitest";
import { Piece } from "../objects/Piece";
import { PIECES, type Matrix2D } from "@app/shared";

it("non rectangular matrix", () => {
  const matrix: Matrix2D<number> = [
    [1, 0, 1],
    [1, 0]
  ];

  expect(() => new Piece("I", matrix).rotate90(1)).toThrowError();
});

describe("matrix rotations", () => {
  it("invalid rotations", () => {
    expect(() => new Piece("I", PIECES.I.matrix).rotate90(0)).toThrowError();
    expect(() => new Piece("I", PIECES.I.matrix).rotate90(-1)).toThrowError();
    expect(() => new Piece("I", PIECES.I.matrix).rotate90(4)).toThrowError();
  });

  it("I", () => {
    const rotationA = new Piece("I", PIECES.I.matrix).rotate90(1);
    const rotationB = new Piece("I", PIECES.I.matrix).rotate90(2);
    const rotationC = new Piece("I", PIECES.I.matrix).rotate90(3);
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
    const rotationA = new Piece("J", PIECES.J.matrix).rotate90(1);
    const rotationB = new Piece("J", PIECES.J.matrix).rotate90(2);
    const rotationC = new Piece("J", PIECES.J.matrix).rotate90(3);
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
    const rotationA = new Piece("L", PIECES.L.matrix).rotate90(1);
    const rotationB = new Piece("L", PIECES.L.matrix).rotate90(2);
    const rotationC = new Piece("L", PIECES.L.matrix).rotate90(3);
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
    const rotationA = new Piece("O", PIECES.O.matrix).rotate90(1);
    const rotationB = new Piece("O", PIECES.O.matrix).rotate90(2);
    const rotationC = new Piece("O", PIECES.O.matrix).rotate90(3);
    expect(rotationA.matrix).toEqual(PIECES.O.matrix);
    expect(rotationB.matrix).toEqual(PIECES.O.matrix);
    expect(rotationC.matrix).toEqual(PIECES.O.matrix);
  });

  it("S", () => {
    const rotationA = new Piece("S", PIECES.S.matrix).rotate90(1);
    const rotationB = new Piece("S", PIECES.S.matrix).rotate90(2);
    const rotationC = new Piece("S", PIECES.S.matrix).rotate90(3);
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
    const rotationA = new Piece("T", PIECES.T.matrix).rotate90(1);
    const rotationB = new Piece("T", PIECES.T.matrix).rotate90(2);
    const rotationC = new Piece("T", PIECES.T.matrix).rotate90(3);
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
    const rotationA = new Piece("Z", PIECES.Z.matrix).rotate90(1);
    const rotationB = new Piece("Z", PIECES.Z.matrix).rotate90(2);
    const rotationC = new Piece("Z", PIECES.Z.matrix).rotate90(3);
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
