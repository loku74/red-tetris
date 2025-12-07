type PieceSize = number;

type PieceColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "orange"
  | "cyan"
  | "gray"
  | "empty";

interface Piece {
  size: PieceSize;
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
export type { PieceSize, PieceColor, Piece, PieceColorDetail };
