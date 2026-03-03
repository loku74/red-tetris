// room
export const ROOM_MAX_USERS = Number(process.env.ROOM_MAX_USERS) || 4;
export const ROOM_MAX = Number(process.env.ROOM_MAX) || 1024;

// server
export const SERVER_PORT = Number(process.env.PUBLIC_SERVER_PORT) || 8080;
export const SERVER_HOST = process.env.PUBLIC_SERVER_ADDRESS || "localhost";

// game
export const GAME_START_DELAY = 3000;
export const MAX_ROTATIONS = 4;

// warmup
export const WARMUP_CHECK_DELAY = 100;
