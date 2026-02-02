import type { UserColor } from "../types/user";
import type { PIECES_TYPES } from "../constants/pieces";

export type PieceType = (typeof PIECES_TYPES)[number];

type PieceColor = UserColor | "empty";

interface Piece {
  size: number;
  color: PieceColor;
}

type PieceColorDetail = Record<
  PieceColor,
  {
    main: string;
    dark: string;
    light: string;
  }
>;

export type { PieceColor, Piece, PieceColorDetail };
