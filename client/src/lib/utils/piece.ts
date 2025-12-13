import type { PieceColorDetail } from "$lib/types/piece";

const pieceColors: PieceColorDetail = {
  red: {
    main: "#E30226",
    dark: "#990218",
    light: "#FE4F6F"
  },
  blue: {
    main: "#024FE7",
    dark: "#003499",
    light: "#548FFF"
  },
  green: {
    main: "#06E32B",
    dark: "#00921F",
    light: "#45FF6F"
  },
  yellow: {
    main: "#E3DF01",
    dark: "#A19F00",
    light: "#FEF735"
  },
  purple: {
    main: "#BC01F5",
    dark: "#730A9A",
    light: "#CA68F3"
  },
  orange: {
    main: "#EB6600",
    dark: "#B54500",
    light: "#FE8E39"
  },
  cyan: {
    main: "#00E1E1",
    dark: "#09A4A2",
    light: "#59FEFF"
  },
  grey: {
    main: "#B3B3B3",
    dark: "#8C8C8C",
    light: "#D9D9D9"
  },
  empty: {
    main: "#1A1A1A",
    dark: "#0D0D0D",
    light: "#262626"
  }
};

export { pieceColors };
