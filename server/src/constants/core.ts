// room
export const ROOM_MAX_USERS = Number(process.env.ROOM_MAX_USERS) || 4;
export const ROOM_MAX = Number(process.env.ROOM_MAX) || 1024;

// server
export const SERVER_PORT = Number(process.env.SERVER_PORT) || 8080;

// game
export const GAME_START_DELAY = 3000;
export const MAX_ROTATIONS = 4;

// warmup
export const WARMUP_CHECK_DELAY = 100;
