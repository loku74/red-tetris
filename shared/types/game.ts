import type { Matrix2D } from "./matrix"
import type { PieceData } from "./piece";

export type GameData = {
  matrix: Matrix2D<number>;
  nextPieces: PieceData[];
  actualPiece: PieceData;
  score: number;
  alive: boolean;
}

export type GameSpectrum = {
  matrix: Matrix2D<number>;
  score: number;
  username: string;
  alive: boolean;
}
