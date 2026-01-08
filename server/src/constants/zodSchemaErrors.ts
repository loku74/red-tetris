import { ROOM_MAX_LENGTH, USERNAME_MAX_LENGTH, CHAT_MAX_LENGTH } from "./core";

export const Z_ROOM_EMPTY = "Room name cannot be empty";
export const Z_ROOM_MAX = `Room name cannot be longer than ${ROOM_MAX_LENGTH} characters`;

export const Z_USERNAME_EMPTY = "Username cannot be empty";
export const Z_USERNAME_MAX = `Username cannot be longer than ${USERNAME_MAX_LENGTH} characters`;

export const Z_MESSAGE_EMPTY = "Message cannot be empty";
export const Z_MESSAGE_MAX = `Message cannot be longer than ${CHAT_MAX_LENGTH} characters`;
export const Z_REGEX_ROOM_AND_USER =
  "Only alphanumeric characters, underscores and hyphens are allowed";
export const Z_REGEX_MESSAGE = "Only unicode characters are allowed";
