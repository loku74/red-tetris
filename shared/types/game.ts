// intern
import { Colors } from "../enums/colors";

// type
import type { Matrix2D } from "./matrix";
import type { PieceData } from "./piece";

export type GameData = {
  matrix: Matrix2D<number>;
  nextPieces: PieceData[];
  actualPiece: PieceData;
  score: number;
  alive: boolean;
};

export type PlayerInfo = {
  matrix: Matrix2D<number>;
  score: number;
  alive: boolean;
  color: Colors;
};
