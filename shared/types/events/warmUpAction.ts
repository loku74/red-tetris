import type { GameActions } from "../../enums/actions";
import type { GameData } from "../game"

export type EventWarmUpActionPayload = {
  action: GameActions
}

export type EventWarmUpActionSuccess = GameData;

export type EventWarmUpActionError = void;
