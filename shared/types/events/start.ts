import type { GameSettings } from "../game";

export type EventStartPayload = { settings?: GameSettings };

export type EventStartSuccess = void;

export type EventStartError = void;
