import type { RoomData } from "../room";

export type EventJoinRoomPayload = {
  roomName: string;
  username: string;
};

export type EventJoinRoomSuccess = {
  username: string;
  roomInfo: RoomData;
};

export type EventJoinRoomError = Partial<EventJoinRoomPayload>;
