import type { UserData } from "./user";

export type RoomData = {
  name: string;
  players: UserData[];
  userCount: number;
  max: number;
  host: string;
  playing: boolean;
};

export type RoomListData = {
  name: string;
  userCount: number;
  max: number;
};
