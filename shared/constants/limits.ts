import type { GameSettings } from "../types/game";

export const USERNAME_MAX_LENGTH = 16;
export const ROOM_MAX_LENGTH = 16;
export const MESSAGE_MAX_LENGTH = 128;
export const GAME_MIN_PLAYERS = 2;
export const GAME_TICK_MIN = 100;
export const GAME_TICK_DEFAULT = 500;
export const GAME_TICK_MAX = 1000;
export const GAME_DESTRUCTIBLE_DEFAULT = false;

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  tick: GAME_TICK_DEFAULT,
  destructiblePenality: GAME_DESTRUCTIBLE_DEFAULT
}
