import { PieceColor } from "../enums/colors";

export type UserData = {
  username: string;
  color: UserColor;
};

export type UserColor = Exclude<PieceColor, PieceColor.EMPTY>;

export function getAllUserColors(): UserColor[] {
  return Object.values(PieceColor).filter(
    (color) => typeof color === "number" && color !== PieceColor.EMPTY
  );
}
