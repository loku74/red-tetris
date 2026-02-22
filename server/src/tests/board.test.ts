import { beforeEach, describe, expect, it } from "vitest";

import { Colors, PieceShape } from "@app/shared";

import { Board } from "@app/objects/Board";
import { Piece } from "@app/objects/Piece";

let board: Board;

beforeEach(() => {
  board = new Board();
});

describe("invalid placements", () => {
  it("top right", () => {
    expect(board.isValidPiece(new Piece(PieceShape.I, -1, 7))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.J, 0, 8))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.L, 0, 8))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.O, 0, 9))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.S, -1, 7))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.T, -1, 8))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.Z, 0, 8))).toBe(false);
  });

  it("top left", () => {
    expect(board.isValidPiece(new Piece(PieceShape.I, -1, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.J, 0, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.L, -1, 0))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.O, 0, -2))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.S, 0, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.T, 0, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.Z, 0, -1))).toBe(false);
  });

  it("bottom right", () => {
    expect(board.isValidPiece(new Piece(PieceShape.I, 19, 8))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.J, 17, 9))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.L, 17, 9))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.O, 17, 9))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.S, 19, 9))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.T, 17, 9))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.Z, 17, 9))).toBe(false);
  });

  it("bottom left", () => {
    expect(board.isValidPiece(new Piece(PieceShape.I, 17, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.J, 17, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.L, 19, 0))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.O, 17, -2))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.S, 17, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.T, 17, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceShape.Z, 17, -1))).toBe(false);
  });
});

describe("valid placements", () => {
  it("top right", () => {
    expect(board.isValidPiece(new Piece(PieceShape.I, 1, 6))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.J, 1, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.L, 1, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.O, 1, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.S, 1, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.T, 1, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.Z, 1, 7))).toBe(true);
  });

  it("top left", () => {
    expect(board.isValidPiece(new Piece(PieceShape.I, 1, 1))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.J, 1, 1))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.L, 1, 1))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.O, 1, 0))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.S, 1, 1))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.T, 1, 1))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.Z, 1, 1))).toBe(true);
  });

  it("bottom right", () => {
    expect(board.isValidPiece(new Piece(PieceShape.I, 18, 6))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.J, 18, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.L, 18, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.O, 18, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.S, 18, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.T, 18, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.Z, 18, 7))).toBe(true);
  });

  it("bottom left", () => {
    expect(board.isValidPiece(new Piece(PieceShape.I, 18, 2))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.J, 18, 2))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.L, 18, 2))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.O, 18, 1))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.S, 18, 2))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.T, 18, 2))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceShape.Z, 18, 2))).toBe(true);
  });
});

it("valid placement", () => {
  const piece = new Piece(PieceShape.T, 18, 4);

  expect(board.isValidPiece(piece)).toBe(true);
  board.place(piece);

  expect(board.matrix[17]?.slice(3, 6)).toEqual([Colors.EMPTY, Colors.PURPLE, Colors.EMPTY]);
  expect(board.matrix[18]?.slice(3, 6)).toEqual([Colors.PURPLE, Colors.PURPLE, Colors.PURPLE]);
});

it("clear lines", () => {
  const board = new Board();

  // first incomplete line
  board.place(new Piece(PieceShape.I, 0, 1));
  board.place(new Piece(PieceShape.S, 1, 7));

  // two others random lines (filled)
  board.place(new Piece(PieceShape.I, 5, 1));
  board.place(new Piece(PieceShape.I, 5, 5));
  board.place(new Piece(PieceShape.S, 6, 8));
  board.place(new Piece(PieceShape.I, 10, 1));
  board.place(new Piece(PieceShape.I, 10, 5));
  board.place(new Piece(PieceShape.S, 11, 8));

  expect(board.cleanLines()).toEqual(2);

  // check if the first line have dropped twice
  expect(board.matrix[2]?.slice(0, 4)).toEqual([
    Colors.CYAN,
    Colors.CYAN,
    Colors.CYAN,
    Colors.CYAN
  ]);
  expect(board.matrix[2]?.slice(7, 9)).toEqual([Colors.GREEN, Colors.GREEN]);
  expect(board.matrix[3]?.slice(6, 8)).toEqual([Colors.GREEN, Colors.GREEN]);
});
