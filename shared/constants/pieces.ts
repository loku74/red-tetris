import { Matrix2D } from "../types/matrix";
import { PieceColor, PieceType } from "../types/piece";

export const PIECES_TYPES = ["I", "J", "L", "O", "S", "T", "Z"] as const;
export const PIECES: Record<PieceType, { matrix: Matrix2D<number>; color: PieceColor }> = {
  I: {
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: "cyan"
  },
  J: {
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: "blue"
  },
  L: {
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: "orange"
  },
  O: {
    matrix: [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0]
    ],
    color: "yellow"
  },
  S: {
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: "green"
  },
  T: {
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: "purple"
  },
  Z: {
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: "red"
  }
};
