import { PIECES, PIECES_TYPES } from "@app/shared";
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
