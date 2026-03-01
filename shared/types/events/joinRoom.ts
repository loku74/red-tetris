import { type UserColor } from "../user";

export type EventJoinRoomPayload = {
  room: string;
  username: string;
};

export type EventJoinRoomSuccess = {
  room: string;
  username: string;
  color: UserColor;
};

export type EventJoinRoomError = Partial<EventJoinRoomPayload>;
