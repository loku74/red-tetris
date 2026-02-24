import { shuffle } from "lodash";

import { PieceShape } from "@app/shared";

import { Piece } from "@app/objects/Piece";

export function createBagOfPieces() {
  const values = Object.values(PieceShape);
  const bag: Piece[] = [];

  values.forEach((shape) => {
    // position spawn based on rules
    // see: https://tetris.wiki/Super_Rotation_System#Spawn_Orientation_and_Location
    let offsetX = 1;
    if (shape === PieceShape.I || shape === PieceShape.O) offsetX--;

    bag.push(new Piece(shape, offsetX, 4));
  });
  return shuffle(bag);
}
