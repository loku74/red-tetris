import type { PieceData, PieceSpectrum } from "./piece";
import type { UserColor } from "./user";

export type GameData = {
  matrix: number[][];
  nextPieces: PieceData[];
  shadowPiece: PieceSpectrum;
  score: number;
  alive: boolean;
};

export type PlayerInfo = {
  name: string;
  color: UserColor;
  matrix: number[][];
  score: number;
  alive: boolean;
};

export type GameSettings = {
  tick: number;
  destructiblePenality: boolean
};

export type Coordinate = [number, number]; // x, y;
