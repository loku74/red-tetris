// intern
import { Colors } from "../enums/colors";

// types
import type { PIECES_TYPES } from "../constants/pieces";
import type { Matrix2D } from "./matrix";

export type PieceType = (typeof PIECES_TYPES)[number];

interface Piece {
  size: number;
  color: Colors;
}

type PieceColorDetail = {
    main: string;
    dark: string;
    light: string;
}

type PieceData = {
  matrix: Matrix2D<number>;
  x: number;
  y: number;
  color: Colors;
}

export type { PieceData, Piece, PieceColorDetail };
