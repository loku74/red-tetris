import { ROOM_MAX_LENGTH, USERNAME_MAX_LENGTH, MESSAGE_MAX_LENGTH } from "@app/shared";

export const Z_ERROR_ROOM_EMPTY = "Room name cannot be empty";
export const Z_ERROR_ROOM_MAX = `Room name cannot be longer than ${ROOM_MAX_LENGTH} characters`;

export const Z_ERROR_USERNAME_EMPTY = "Username cannot be empty";
export const Z_ERROR_USERNAME_MAX = `Username cannot be longer than ${USERNAME_MAX_LENGTH} characters`;

export const Z_ERROR_MESSAGE_EMPTY = "Message cannot be empty";
export const Z_ERROR_MESSAGE_MAX = `Message cannot be longer than ${MESSAGE_MAX_LENGTH} characters`;
export const Z_ERROR_REGEX_ROOM_AND_USER =
  "Only alphanumeric characters, underscores and hyphens are allowed";
export const Z_ERROR_REGEX_MESSAGE = "Only unicode characters are allowed";
