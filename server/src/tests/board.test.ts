import { describe, expect, it, beforeEach } from "vitest";
import { Board } from "../objects/Board";
import { Piece } from "../objects/Piece";
import { Colors, PieceType } from "@app/shared";

let board: Board;

beforeEach(() => {
  board = new Board();
});

describe("invalid placements", () => {
  it("top right", () => {
    expect(board.isValidPiece(new Piece(PieceType.I, -1, 7))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.J, 0, 8))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.L, 0, 8))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.O, 0, 9))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.S, -1, 7))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.T, -1, 8))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.Z, 0, 8))).toBe(false);
  });

  it("top left", () => {
    expect(board.isValidPiece(new Piece(PieceType.I, -1, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.J, 0, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.L, -1, 0))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.O, 0, -2))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.S, 0, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.T, 0, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.Z, 0, -1))).toBe(false);
  });

  it("bottom right", () => {
    expect(board.isValidPiece(new Piece(PieceType.I, 18, 7))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.J, 17, 8))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.L, 17, 8))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.O, 17, 9))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.S, 19, 7))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.T, 17, 8))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.Z, 17, 8))).toBe(false);
  });

  it("bottom left", () => {
    expect(board.isValidPiece(new Piece(PieceType.I, 17, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.J, 17, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.L, 19, 0))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.O, 17, -2))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.S, 17, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.T, 17, -1))).toBe(false);
    expect(board.isValidPiece(new Piece(PieceType.Z, 17, -1))).toBe(false);
  });
});

describe("valid placements", () => {
  it("top right", () => {
    expect(board.isValidPiece(new Piece(PieceType.I, -1, 6))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.J, 0, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.L, 0, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.O, 0, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.S, 0, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.T, 0, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.Z, 0, 7))).toBe(true);
  });

  it("top left", () => {
    expect(board.isValidPiece(new Piece(PieceType.I, -1, 0))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.J, 0, 0))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.L, 0, 0))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.O, 0, -1))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.S, 0, 0))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.T, 0, 0))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.Z, 0, 0))).toBe(true);
  });

  it("bottom right", () => {
    expect(board.isValidPiece(new Piece(PieceType.I, 18, 6))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.J, 18, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.L, 18, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.O, 18, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.S, 18, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.T, 18, 7))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.Z, 18, 7))).toBe(true);
  });

  it("bottom left", () => {
    expect(board.isValidPiece(new Piece(PieceType.I, 18, 0))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.J, 18, 0))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.L, 18, 0))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.O, 18, -1))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.S, 18, 0))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.T, 18, 0))).toBe(true);
    expect(board.isValidPiece(new Piece(PieceType.Z, 18, 0))).toBe(true);
  });
});

it("valid placement", () => {
  const piece = new Piece(PieceType.T, 18, 4);

  expect(board.isValidPiece(piece)).toBe(true);
  board.place(piece);

  expect(board.matrix[18]?.slice(4, 7)).toEqual([Colors.EMPTY, Colors.PURPLE, Colors.EMPTY]);
  expect(board.matrix[19]?.slice(4, 7)).toEqual([Colors.PURPLE, Colors.PURPLE, Colors.PURPLE]);
});

it("clear lines", () => {
  const board = new Board();

  // first incomplete line
  board.place(new Piece(PieceType.I, -1, 0));
  board.place(new Piece(PieceType.S, 0, 7));

  // two others random lines (filled)
  board.place(new Piece(PieceType.I, 5, 0));
  board.place(new Piece(PieceType.I, 5, 4));
  board.place(new Piece(PieceType.S, 6, 7));
  board.place(new Piece(PieceType.I, 10, 0));
  board.place(new Piece(PieceType.I, 10, 4));
  board.place(new Piece(PieceType.S, 11, 7));

  expect(board.cleanLines()).toEqual(2);

  // check if the first line have dropped twice
  expect(board.matrix[2]?.slice(0, 4)).toEqual([
    Colors.CYAN,
    Colors.CYAN,
    Colors.CYAN,
    Colors.CYAN
  ]);
  expect(board.matrix[2]?.slice(8, 10)).toEqual([Colors.GREEN, Colors.GREEN]);
  expect(board.matrix[3]?.slice(7, 9)).toEqual([Colors.GREEN, Colors.GREEN]);
});
