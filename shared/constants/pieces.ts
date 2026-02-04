// intern
import { Colors } from "../enums/colors";

// type
import type { Matrix2D } from "../types/matrix";
import type { PieceType } from "../types/piece";

export const PIECES_TYPES = ["I", "J", "L", "O", "S", "T", "Z"] as const;
export const PIECES: Record<PieceType, { matrix: Matrix2D<number>; color: Colors }> = {
  I: {
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: Colors.CYAN
  },
  J: {
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: Colors.BLUE
  },
  L: {
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: Colors.ORANGE
  },
  O: {
    matrix: [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0]
    ],
    color: Colors.YELLOW
  },
  S: {
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: Colors.GREEN
  },
  T: {
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: Colors.PURPLE
  },
  Z: {
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: Colors.RED
  }
};
