// system
export const USERNAME_MAX_LENGTH = Number(process.env.USERNAME_MAX_LENGTH) || 16;

// room
export const ROOM_MAX_LENGTH = Number(process.env.ROOM_MAX_LENGTH) || 16;
export const ROOM_MAX_USERS = Number(process.env.ROOM_MAX_USERS) || 8;
export const ROOM_MAX = Number(process.env.ROOM_MAX) || 1024;

// chat & user
export const SERVER_PORT = Number(process.env.SERVER_PORT) || 8080;
export const CHAT_MAX_LENGTH = Number(process.env.CHAT_MAX_LENGTH) || 128;

// game
export const WARMUP_RESTART_DELAY = Number(process.env.RESTART_DELAY) || 5;
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// regex
export const REGEX_ROOM_AND_USER = /^[a-zA-Z0-9_-]+$/;
export const REGEX_MESSAGE = /^[\P{C}]+$/u;
