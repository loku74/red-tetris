// intern
import { PieceColor } from "../enums/colors";

// type
import type { PieceData, PieceSpectrum } from "./piece";

export type GameData = {
  matrix: number[][];
  nextPieces: PieceData[];
  shadowPiece: PieceSpectrum;
  score: number;
  alive: boolean;
};

export type PlayerInfo = {
  matrix: number[][];
  score: number;
  alive: boolean;
  color: PieceColor;
};

export type GameSettings = {
  tick: number;
};

export type Coordinate = [number, number]; // x, y;
