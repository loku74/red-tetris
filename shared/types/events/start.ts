import type { RoomData } from "../room";

export type EventStartPayload = void;

export type EventStartSuccess = void;

export type EventStartError = {
  room?: string;
};

export type EventStartData = RoomData;
