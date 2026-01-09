import { describe, expect, it, beforeEach } from "vitest";
import { Board } from "../objects/Board";
import { BOARD_HEIGHT, BOARD_WIDTH } from "../constants/core";
import { Piece } from "../objects/Piece";
import { PIECES } from "../constants/pieces";

let board: Board;

beforeEach(() => {
  board = new Board(BOARD_WIDTH, BOARD_HEIGHT);
});

it("invalid constructor", () => {
  expect(() => new Board(0, 0)).toThrowError();
  expect(() => new Board(1, 0)).toThrowError();
  expect(() => new Board(0, 1)).toThrowError();
  expect(new Board(1, 1)).toBeDefined();
});

describe("invalid placements", () => {
  it("top right", () => {
    expect(board.isValidPlacement(new Piece("I", PIECES.I), -1, 7)).toBe(false);
    expect(board.isValidPlacement(new Piece("J", PIECES.J), 0, 8)).toBe(false);
    expect(board.isValidPlacement(new Piece("L", PIECES.L), 0, 8)).toBe(false);
    expect(board.isValidPlacement(new Piece("O", PIECES.O), 0, 9)).toBe(false);
    expect(board.isValidPlacement(new Piece("S", PIECES.S), -1, 7)).toBe(false);
    expect(board.isValidPlacement(new Piece("T", PIECES.T), -1, 8)).toBe(false);
    expect(board.isValidPlacement(new Piece("Z", PIECES.Z), 0, 8)).toBe(false);
  });

  it("top left", () => {
    expect(board.isValidPlacement(new Piece("I", PIECES.I), -1, -1)).toBe(false);
    expect(board.isValidPlacement(new Piece("J", PIECES.J), 0, -1)).toBe(false);
    expect(board.isValidPlacement(new Piece("L", PIECES.L), -1, 0)).toBe(false);
    expect(board.isValidPlacement(new Piece("O", PIECES.O), 0, -2)).toBe(false);
    expect(board.isValidPlacement(new Piece("S", PIECES.S), 0, -1)).toBe(false);
    expect(board.isValidPlacement(new Piece("T", PIECES.T), 0, -1)).toBe(false);
    expect(board.isValidPlacement(new Piece("Z", PIECES.Z), 0, -1)).toBe(false);
  });

  it("bottom right", () => {
    expect(board.isValidPlacement(new Piece("I", PIECES.I), 18, 7)).toBe(false);
    expect(board.isValidPlacement(new Piece("J", PIECES.J), 17, 8)).toBe(false);
    expect(board.isValidPlacement(new Piece("L", PIECES.L), 17, 8)).toBe(false);
    expect(board.isValidPlacement(new Piece("O", PIECES.O), 17, 9)).toBe(false);
    expect(board.isValidPlacement(new Piece("S", PIECES.S), 19, 7)).toBe(false);
    expect(board.isValidPlacement(new Piece("T", PIECES.T), 17, 8)).toBe(false);
    expect(board.isValidPlacement(new Piece("Z", PIECES.Z), 17, 8)).toBe(false);
  });

  it("bottom left", () => {
    expect(board.isValidPlacement(new Piece("I", PIECES.I), 17, -1)).toBe(false);
    expect(board.isValidPlacement(new Piece("J", PIECES.J), 17, -1)).toBe(false);
    expect(board.isValidPlacement(new Piece("L", PIECES.L), 19, 0)).toBe(false);
    expect(board.isValidPlacement(new Piece("O", PIECES.O), 17, -2)).toBe(false);
    expect(board.isValidPlacement(new Piece("S", PIECES.S), 17, -1)).toBe(false);
    expect(board.isValidPlacement(new Piece("T", PIECES.T), 17, -1)).toBe(false);
    expect(board.isValidPlacement(new Piece("Z", PIECES.Z), 17, -1)).toBe(false);
  });
});

describe("valid placements", () => {
  it("top right", () => {
    expect(board.isValidPlacement(new Piece("I", PIECES.I), -1, 6)).toBe(true);
    expect(board.isValidPlacement(new Piece("J", PIECES.J), 0, 7)).toBe(true);
    expect(board.isValidPlacement(new Piece("L", PIECES.L), 0, 7)).toBe(true);
    expect(board.isValidPlacement(new Piece("O", PIECES.O), 0, 7)).toBe(true);
    expect(board.isValidPlacement(new Piece("S", PIECES.S), 0, 7)).toBe(true);
    expect(board.isValidPlacement(new Piece("T", PIECES.T), 0, 7)).toBe(true);
    expect(board.isValidPlacement(new Piece("Z", PIECES.Z), 0, 7)).toBe(true);
  });

  it("top left", () => {
    expect(board.isValidPlacement(new Piece("I", PIECES.I), -1, 0)).toBe(true);
    expect(board.isValidPlacement(new Piece("J", PIECES.J), 0, 0)).toBe(true);
    expect(board.isValidPlacement(new Piece("L", PIECES.L), 0, 0)).toBe(true);
    expect(board.isValidPlacement(new Piece("O", PIECES.O), 0, -1)).toBe(true);
    expect(board.isValidPlacement(new Piece("S", PIECES.S), 0, 0)).toBe(true);
    expect(board.isValidPlacement(new Piece("T", PIECES.T), 0, 0)).toBe(true);
    expect(board.isValidPlacement(new Piece("Z", PIECES.Z), 0, 0)).toBe(true);
  });

  it("bottom right", () => {
    expect(board.isValidPlacement(new Piece("I", PIECES.I), 18, 6)).toBe(true);
    expect(board.isValidPlacement(new Piece("J", PIECES.J), 18, 7)).toBe(true);
    expect(board.isValidPlacement(new Piece("L", PIECES.L), 18, 7)).toBe(true);
    expect(board.isValidPlacement(new Piece("O", PIECES.O), 18, 7)).toBe(true);
    expect(board.isValidPlacement(new Piece("S", PIECES.S), 18, 7)).toBe(true);
    expect(board.isValidPlacement(new Piece("T", PIECES.T), 18, 7)).toBe(true);
    expect(board.isValidPlacement(new Piece("Z", PIECES.Z), 18, 7)).toBe(true);
  });

  it("bottom left", () => {
    expect(board.isValidPlacement(new Piece("I", PIECES.I), 18, 0)).toBe(true);
    expect(board.isValidPlacement(new Piece("J", PIECES.J), 18, 0)).toBe(true);
    expect(board.isValidPlacement(new Piece("L", PIECES.L), 18, 0)).toBe(true);
    expect(board.isValidPlacement(new Piece("O", PIECES.O), 18, -1)).toBe(true);
    expect(board.isValidPlacement(new Piece("S", PIECES.S), 18, 0)).toBe(true);
    expect(board.isValidPlacement(new Piece("T", PIECES.T), 18, 0)).toBe(true);
    expect(board.isValidPlacement(new Piece("Z", PIECES.Z), 18, 0)).toBe(true);
  });
});

it("valid placement", () => {
  const piece = new Piece("T", PIECES.T);

  expect(board.isValidPlacement(piece, 18, 4)).toBe(true);
  board.place(piece, 18, 4);

  expect(board.matrix[18]?.slice(4, 7)).toEqual([0, 1, 0]);
  expect(board.matrix[19]?.slice(4, 7)).toEqual([1, 1, 1]);
});

it("clear lines", () => {
  const board = new Board(BOARD_WIDTH, BOARD_HEIGHT);
  const pieceI = new Piece("I", PIECES.I);
  const pieceS = new Piece("S", PIECES.S);

  // first incomplete line
  board.place(pieceI, -1, 0);
  board.place(pieceS, 0, 7);

  // two others random lines (filled)
  board.place(pieceI, 5, 0);
  board.place(pieceI, 5, 4);
  board.place(pieceS, 6, 7);
  board.place(pieceI, 10, 0);
  board.place(pieceI, 10, 4);
  board.place(pieceS, 11, 7);

  expect(board.cleanLines()).toEqual(2);

  // check if the first line have dropped twice
  expect(board.matrix[2]?.slice(0, 4)).toEqual([1, 1, 1, 1]);
  expect(board.matrix[2]?.slice(8, 10)).toEqual([1, 1]);
  expect(board.matrix[3]?.slice(7, 9)).toEqual([1, 1]);
});
