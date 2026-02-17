// intern
import { Colors } from "../enums/colors";
import type { Coordinate } from "./game";

interface Piece {
  size: number | string;
  color: Colors;
}

type PieceColorDetail = {
  main: string;
  dark: string;
  light: string;
};

type PieceData = {
  matrix: number[][];
  x: number;
  y: number;
  color: Colors;
};

type PieceSpectrum = {
  blocks: Coordinate[];
  color: Colors;
};

export type { PieceData, Piece, PieceColorDetail, PieceSpectrum };
