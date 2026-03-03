import type { GameScore } from "@app/shared";

// server
export const SERVER_PORT = Number(process.env.PUBLIC_SERVER_PORT);
export const SERVER_HOST = process.env.PUBLIC_SERVER_ADDRESS;

// room
export const ROOM_MAX_USERS = 4;
export const ROOM_MAX = 1024;

// game
export const GAME_START_DELAY = 3000;
export const MAX_ROTATIONS = 4;

// warmup
export const WARMUP_CHECK_DELAY = 100;

// score
export const SCORE_PIECE = 5;
export const SCORE_DICT: Record<number, GameScore> = {
  1: { score: 42, type: "single" },
  2: { score: 142, type: "double" },
  3: { score: 420, type: "triple" },
  4: { score: 4242, type: "tetris" }
};
