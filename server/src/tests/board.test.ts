import { describe, expect, it, beforeEach } from "vitest";
import { Board } from "../objects/Board";
import { Piece } from "../objects/Piece";
import { Colors, PIECES } from "@app/shared";

let board: Board;

beforeEach(() => {
  board = new Board();
});

describe("invalid placements", () => {
  it("top right", () => {
    expect(board.isValidPiece(new Piece("I", PIECES.I.matrix, -1, 7))).toBe(false);
    expect(board.isValidPiece(new Piece("J", PIECES.J.matrix, 0, 8))).toBe(false);
    expect(board.isValidPiece(new Piece("L", PIECES.L.matrix, 0, 8))).toBe(false);
    expect(board.isValidPiece(new Piece("O", PIECES.O.matrix, 0, 9))).toBe(false);
    expect(board.isValidPiece(new Piece("S", PIECES.S.matrix, -1, 7))).toBe(false);
    expect(board.isValidPiece(new Piece("T", PIECES.T.matrix, -1, 8))).toBe(false);
    expect(board.isValidPiece(new Piece("Z", PIECES.Z.matrix, 0, 8))).toBe(false);
  });

  it("top left", () => {
    expect(board.isValidPiece(new Piece("I", PIECES.I.matrix, -1, -1))).toBe(false);
    expect(board.isValidPiece(new Piece("J", PIECES.J.matrix, 0, -1))).toBe(false);
    expect(board.isValidPiece(new Piece("L", PIECES.L.matrix, -1, 0))).toBe(false);
    expect(board.isValidPiece(new Piece("O", PIECES.O.matrix, 0, -2))).toBe(false);
    expect(board.isValidPiece(new Piece("S", PIECES.S.matrix, 0, -1))).toBe(false);
    expect(board.isValidPiece(new Piece("T", PIECES.T.matrix, 0, -1))).toBe(false);
    expect(board.isValidPiece(new Piece("Z", PIECES.Z.matrix, 0, -1))).toBe(false);
  });

  it("bottom right", () => {
    expect(board.isValidPiece(new Piece("I", PIECES.I.matrix, 18, 7))).toBe(false);
    expect(board.isValidPiece(new Piece("J", PIECES.J.matrix, 17, 8))).toBe(false);
    expect(board.isValidPiece(new Piece("L", PIECES.L.matrix, 17, 8))).toBe(false);
    expect(board.isValidPiece(new Piece("O", PIECES.O.matrix, 17, 9))).toBe(false);
    expect(board.isValidPiece(new Piece("S", PIECES.S.matrix, 19, 7))).toBe(false);
    expect(board.isValidPiece(new Piece("T", PIECES.T.matrix, 17, 8))).toBe(false);
    expect(board.isValidPiece(new Piece("Z", PIECES.Z.matrix, 17, 8))).toBe(false);
  });

  it("bottom left", () => {
    expect(board.isValidPiece(new Piece("I", PIECES.I.matrix, 17, -1))).toBe(false);
    expect(board.isValidPiece(new Piece("J", PIECES.J.matrix, 17, -1))).toBe(false);
    expect(board.isValidPiece(new Piece("L", PIECES.L.matrix, 19, 0))).toBe(false);
    expect(board.isValidPiece(new Piece("O", PIECES.O.matrix, 17, -2))).toBe(false);
    expect(board.isValidPiece(new Piece("S", PIECES.S.matrix, 17, -1))).toBe(false);
    expect(board.isValidPiece(new Piece("T", PIECES.T.matrix, 17, -1))).toBe(false);
    expect(board.isValidPiece(new Piece("Z", PIECES.Z.matrix, 17, -1))).toBe(false);
  });
});

describe("valid placements", () => {
  it("top right", () => {
    expect(board.isValidPiece(new Piece("I", PIECES.I.matrix, -1, 6))).toBe(true);
    expect(board.isValidPiece(new Piece("J", PIECES.J.matrix, 0, 7))).toBe(true);
    expect(board.isValidPiece(new Piece("L", PIECES.L.matrix, 0, 7))).toBe(true);
    expect(board.isValidPiece(new Piece("O", PIECES.O.matrix, 0, 7))).toBe(true);
    expect(board.isValidPiece(new Piece("S", PIECES.S.matrix, 0, 7))).toBe(true);
    expect(board.isValidPiece(new Piece("T", PIECES.T.matrix, 0, 7))).toBe(true);
    expect(board.isValidPiece(new Piece("Z", PIECES.Z.matrix, 0, 7))).toBe(true);
  });

  it("top left", () => {
    expect(board.isValidPiece(new Piece("I", PIECES.I.matrix, -1, 0))).toBe(true);
    expect(board.isValidPiece(new Piece("J", PIECES.J.matrix, 0, 0))).toBe(true);
    expect(board.isValidPiece(new Piece("L", PIECES.L.matrix, 0, 0))).toBe(true);
    expect(board.isValidPiece(new Piece("O", PIECES.O.matrix, 0, -1))).toBe(true);
    expect(board.isValidPiece(new Piece("S", PIECES.S.matrix, 0, 0))).toBe(true);
    expect(board.isValidPiece(new Piece("T", PIECES.T.matrix, 0, 0))).toBe(true);
    expect(board.isValidPiece(new Piece("Z", PIECES.Z.matrix, 0, 0))).toBe(true);
  });

  it("bottom right", () => {
    expect(board.isValidPiece(new Piece("I", PIECES.I.matrix, 18, 6))).toBe(true);
    expect(board.isValidPiece(new Piece("J", PIECES.J.matrix, 18, 7))).toBe(true);
    expect(board.isValidPiece(new Piece("L", PIECES.L.matrix, 18, 7))).toBe(true);
    expect(board.isValidPiece(new Piece("O", PIECES.O.matrix, 18, 7))).toBe(true);
    expect(board.isValidPiece(new Piece("S", PIECES.S.matrix, 18, 7))).toBe(true);
    expect(board.isValidPiece(new Piece("T", PIECES.T.matrix, 18, 7))).toBe(true);
    expect(board.isValidPiece(new Piece("Z", PIECES.Z.matrix, 18, 7))).toBe(true);
  });

  it("bottom left", () => {
    expect(board.isValidPiece(new Piece("I", PIECES.I.matrix, 18, 0))).toBe(true);
    expect(board.isValidPiece(new Piece("J", PIECES.J.matrix, 18, 0))).toBe(true);
    expect(board.isValidPiece(new Piece("L", PIECES.L.matrix, 18, 0))).toBe(true);
    expect(board.isValidPiece(new Piece("O", PIECES.O.matrix, 18, -1))).toBe(true);
    expect(board.isValidPiece(new Piece("S", PIECES.S.matrix, 18, 0))).toBe(true);
    expect(board.isValidPiece(new Piece("T", PIECES.T.matrix, 18, 0))).toBe(true);
    expect(board.isValidPiece(new Piece("Z", PIECES.Z.matrix, 18, 0))).toBe(true);
  });
});

it("valid placement", () => {
  const piece = new Piece("T", PIECES.T.matrix, 18, 4);

  expect(board.isValidPiece(piece)).toBe(true);
  board.place(piece);

  expect(board.matrix[18]?.slice(4, 7)).toEqual([Colors.EMPTY, Colors.GREY, Colors.EMPTY]);
  expect(board.matrix[19]?.slice(4, 7)).toEqual([Colors.GREY, Colors.GREY, Colors.GREY]);
});

it("clear lines", () => {
  const board = new Board();

  // first incomplete line
  board.place(new Piece("I", PIECES.I.matrix, -1, 0));
  board.place(new Piece("S", PIECES.S.matrix, 0, 7));

  // two others random lines (filled)
  board.place(new Piece("I", PIECES.I.matrix, 5, 0));
  board.place(new Piece("I", PIECES.I.matrix, 5, 4));
  board.place(new Piece("S", PIECES.S.matrix, 6, 7));
  board.place(new Piece("I", PIECES.I.matrix, 10, 0));
  board.place(new Piece("I", PIECES.I.matrix, 10, 4));
  board.place(new Piece("S", PIECES.S.matrix, 11, 7));

  expect(board.cleanLines()).toEqual(2);

  // check if the first line have dropped twice
  expect(board.matrix[2]?.slice(0, 4)).toEqual([
    Colors.GREY,
    Colors.GREY,
    Colors.GREY,
    Colors.GREY
  ]);
  expect(board.matrix[2]?.slice(8, 10)).toEqual([Colors.GREY, Colors.GREY]);
  expect(board.matrix[3]?.slice(7, 9)).toEqual([Colors.GREY, Colors.GREY]);
});
