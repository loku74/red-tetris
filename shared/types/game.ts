import type { PieceData, PieceSpectrum } from "./piece";
import type { UserColor } from "./user";

export type GameData = {
  matrix: number[][];
  nextPieces: PieceData[];
  shadowPiece: PieceSpectrum | undefined;
  score: number;
  alive: boolean;
  gameScore?: GameScore;
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
  destructiblePenality: boolean;
};

export type Coordinate = [number, number]; // x, y;

export type GameScore = {
  score: number;
  type: string;
};

export type PlayerScore = {
  name: string;
  color: UserColor;
  score: number;
};
