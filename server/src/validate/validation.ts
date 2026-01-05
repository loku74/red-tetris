import z, { ZodError } from "zod";
import { CHAT_MAX_LENGTH, ROOM_MAX_LENGTH, USERNAME_MAX_LENGTH } from "../constants";

export function formatSchemeError(error: ZodError) {
  return error.issues.reduce(
    (acc, issue) => {
      const varName = issue.path.join(".");
      acc[varName] = issue.message;
      return acc;
    },
    {} as Record<string, string>
  );
}

export const roomValidation = z
  .string()
  .min(1, "Room name cannot be empty")
  .max(ROOM_MAX_LENGTH, `Room name cannot be longer than ${ROOM_MAX_LENGTH} characters`);

export const usernameValidation = z
  .string()
  .min(1, "Username cannot be empty")
  .max(USERNAME_MAX_LENGTH, `Username cannot be longer than ${USERNAME_MAX_LENGTH} characters`);

export const messageValidation = z
  .string()
  .min(1, "Message cannot be empty")
  .max(CHAT_MAX_LENGTH, `Message cannot be longer than ${CHAT_MAX_LENGTH} characters`);
