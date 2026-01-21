import { PIECES } from "../constants/pieces";
import { Piece } from "../objects/Piece";
import type { Matrix2D, NonEmptyArray, PieceType } from "../types/types";

function randint(a: number, b: number) {
  const range = b - a;

  return a + Math.floor(Math.random() * (range + 1));
}

export function createPiece() {
  const types = Object.keys(PIECES) as PieceType[];
  const randomType = types[randint(0, types.length - 1)];

  if (!randomType) throw new Error("Key generation failed!");
  const data = PIECES[randomType];

  // position spawn based on rules
  // see: https://tetris.wiki/Super_Rotation_System#Spawn_Orientation_and_Location
  let offsetX = 0;
  if (randomType === "I") offsetX--;

  return new Piece(randomType, data.matrix, offsetX, 3, data.color);
}

export function asMatrix(data: (number | undefined)[][]): Matrix2D<number> {
  const rows: NonEmptyArray<number>[] = data.map((row) => {
    const checked: number[] = row.map((cell) => {
      if (cell === undefined) throw new Error("Cell cannot be undefined!");
      return cell;
    });
    const [first, ...others] = checked;
    if (first === undefined) throw new Error("Cell cannot be undefined!");

    return [first, ...others];
  });
  const [first, ...others] = rows;
  if (first === undefined) throw new Error("Row cannot be undefined!");

  return [first, ...others];
}
