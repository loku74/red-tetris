import type { GameData } from "../game";
import type { UserData } from "../user";

export type EventSpectatePayload = {
  username: string;
};

export type EventSpectateSuccess = {
  userData: UserData;
  gameData: GameData;
};

export type EventSpectateError = void;

export type EventSpectateData = number;
