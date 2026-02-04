import { Colors } from "../../enums/colors";

export type EventJoinRoomPayload = {
  room: string;
  username: string;
};

export type EventJoinRoomSuccess = {
  room: string;
  username: string;
  color: Colors;
};

export type EventJoinRoomError = Partial<EventJoinRoomPayload>;
