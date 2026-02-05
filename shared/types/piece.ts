// intern
import { Colors } from "../enums/colors";

// types
import type { Matrix2D } from "./matrix";

interface Piece {
  size: number;
  color: Colors;
}

type PieceColorDetail = {
  main: string;
  dark: string;
  light: string;
};

type PieceData = {
  matrix: Matrix2D<number>;
  x: number;
  y: number;
  color: Colors;
};

export type { PieceData, Piece, PieceColorDetail };
