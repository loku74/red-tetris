// validation (server-side: full string must match)
export const REGEX_ROOM_AND_USER = /^[a-zA-Z0-9_-]+$/;
export const REGEX_MESSAGE = /^[\P{C}]+$/u;

// sanitization (client-side: strips invalid characters)
export const REGEX_ROOM_AND_USER_SANITIZE = /[^a-zA-Z0-9_-]+/g;
export const REGEX_MESSAGE_SANITIZE = /[\p{C}]+/gu;
