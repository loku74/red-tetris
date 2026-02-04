import type { Matrix2D } from "./matrix";
import type { PieceData } from "./piece";
import type { UserColor } from "./user";

export type GameData = {
  matrix: Matrix2D<number>;
  nextPieces: PieceData[];
  actualPiece: PieceData;
  score: number;
  alive: boolean;
};

export type PlayerInfo = {
  board: Matrix2D<number>;
  score: number;
  alive: boolean;
  color: UserColor;
};
