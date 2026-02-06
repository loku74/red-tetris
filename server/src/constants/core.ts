// room
export const ROOM_MAX_USERS = Number(process.env.ROOM_MAX_USERS) || 8;
export const ROOM_MAX = Number(process.env.ROOM_MAX) || 1024;

// server
export const SERVER_PORT = Number(process.env.SERVER_PORT) || 8080;

// game
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const GAME_TICK_DEFAULT = 500;
export const GAME_START_DELAY = 3000;

// warmup
export const WARMUP_CHECK_DELAY = 100;
