import { PIECES } from "../constants/pieces";
import { Piece } from "../objects/Piece";
import type { PieceType } from "../types/types";

function randint(a: number, b: number) {
  const range = b - a;

  return a + Math.floor(Math.random() * (range + 1));
}

export function createPiece() {
  const types = Object.keys(PIECES) as PieceType[];
  const randomType = types[randint(0, types.length - 1)];

  if (!randomType) throw new Error("Key generation failed!");
  const matrix = PIECES[randomType];
  if (!matrix) throw new Error("Matrix generation failed!");

  const rotations = randint(0, 3);
  const piece = new Piece(randomType, matrix);

  return piece.rotate90(rotations);
}
