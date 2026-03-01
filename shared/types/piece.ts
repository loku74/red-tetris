// intern
import { PieceColor } from "../enums/colors";
import type { Coordinate } from "./game";

interface Piece {
  size: number | string;
  color: PieceColor;
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
  color: PieceColor;
};

type PieceSpectrum = {
  blocks: Coordinate[];
  color: PieceColor;
};

export type { PieceData, Piece, PieceColorDetail, PieceSpectrum };
