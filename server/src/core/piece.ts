import { PIECES, PIECES_TYPES, type Matrix2D, type NonEmptyArray } from "@app/shared";
import { Piece } from "../objects/Piece";

function randint(max: number) {
  // max is excluded
  return Math.floor(Math.random() * max);
}

export function createPiece() {
  const randomType = PIECES_TYPES[randint(PIECES_TYPES.length)];

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
