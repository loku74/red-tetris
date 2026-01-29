import type { UserData } from "@app/shared";

export type RoomData = {
  name: string;
  players: UserData[];
  userCount: number;
  max: number;
  host: string;
  playing: boolean;
  warmUpRestartDelay: number;
};

export type RoomListData = {
  name: string;
  userCount: number;
  max: number;
};
