import { PieceColor } from "../enums/colors";
import type { PieceColorDetail } from "../types/piece";

export const PIECE_COLORS: Record<PieceColor, PieceColorDetail> = {
  [PieceColor.RED]: {
    main: "#E30226",
    dark: "#990218",
    light: "#FE4F6F"
  },
  [PieceColor.BLUE]: {
    main: "#024FE7",
    dark: "#003499",
    light: "#548FFF"
  },
  [PieceColor.GREEN]: {
    main: "#06E32B",
    dark: "#00921F",
    light: "#45FF6F"
  },
  [PieceColor.YELLOW]: {
    main: "#E3DF01",
    dark: "#A19F00",
    light: "#FEF735"
  },
  [PieceColor.PURPLE]: {
    main: "#BC01F5",
    dark: "#730A9A",
    light: "#CA68F3"
  },
  [PieceColor.ORANGE]: {
    main: "#EB6600",
    dark: "#B54500",
    light: "#FE8E39"
  },
  [PieceColor.CYAN]: {
    main: "#00E1E1",
    dark: "#09A4A2",
    light: "#59FEFF"
  },
  [PieceColor.GREY]: {
    main: "#B3B3B3",
    dark: "#8C8C8C",
    light: "#D9D9D9"
  },
  [PieceColor.EMPTY]: {
    main: "#1A1A1A",
    dark: "#0D0D0D",
    light: "#262626"
  }
};
