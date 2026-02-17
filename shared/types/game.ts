// intern
import { Colors } from "../enums/colors";

// type
import type { Matrix2D } from "./matrix";
import type { PieceData, PieceSpectrum } from "./piece";

export type GameData = {
  matrix: Matrix2D<number>;
  nextPieces: PieceData[];
  shadowPiece: PieceSpectrum;
  score: number;
  alive: boolean;
};

export type PlayerInfo = {
  matrix: Matrix2D<number>;
  score: number;
  alive: boolean;
  color: Colors;
};

export type GameSettings = {
  tick: number;
};

export type Coordinate = [number, number]; // x, y;
