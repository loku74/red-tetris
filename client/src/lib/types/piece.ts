import type { UserColor } from "@app/shared";

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
