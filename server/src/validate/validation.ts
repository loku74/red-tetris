import z, { ZodError } from "zod";

import {
  GAME_TICK_MAX,
  GAME_TICK_MIN,
  GameActions,
  MESSAGE_MAX_LENGTH,
  REGEX_MESSAGE,
  REGEX_ROOM_AND_USER,
  ROOM_MAX_LENGTH,
  USERNAME_MAX_LENGTH} from "@app/shared";

import * as ZodSchemaErrors from "@app/constants/zodSchemaErrors";

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
  .regex(REGEX_ROOM_AND_USER, ZodSchemaErrors.Z_ERROR_REGEX_ROOM_AND_USER)
  .min(1, ZodSchemaErrors.Z_ERROR_ROOM_EMPTY)
  .max(ROOM_MAX_LENGTH, ZodSchemaErrors.Z_ERROR_ROOM_MAX);

export const usernameValidation = z
  .string()
  .regex(REGEX_ROOM_AND_USER, ZodSchemaErrors.Z_ERROR_REGEX_ROOM_AND_USER)
  .min(1, ZodSchemaErrors.Z_ERROR_USERNAME_EMPTY)
  .max(USERNAME_MAX_LENGTH, ZodSchemaErrors.Z_ERROR_USERNAME_MAX);

export const messageValidation = z
  .string()
  .regex(REGEX_MESSAGE, ZodSchemaErrors.Z_ERROR_REGEX_MESSAGE)
  .min(1, ZodSchemaErrors.Z_ERROR_MESSAGE_EMPTY)
  .max(MESSAGE_MAX_LENGTH, ZodSchemaErrors.Z_ERROR_MESSAGE_MAX);

export const actionValidation = z.enum(GameActions);

export const tickValidation = z.int().min(GAME_TICK_MIN).max(GAME_TICK_MAX);
