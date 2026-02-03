import type { GameAction, GameData } from "../game"

export type EventWarmupActionPayload = {
  action: GameAction
}

export type EventWarmupActionSuccess = GameData;

export type EventWarmupActionError = void;
