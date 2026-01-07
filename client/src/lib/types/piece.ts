import type { SocketUserColor } from "server-types";

type PieceColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "orange"
  | "cyan"
  | "grey"
  | "empty";

interface Piece {
  size: number;
  color: PieceColor;
}

type PieceColorDetail = Record<
  PieceColor | SocketUserColor,
  {
    main: string;
    dark: string;
    light: string;
  }
>;
export type { PieceColor, Piece, PieceColorDetail };
