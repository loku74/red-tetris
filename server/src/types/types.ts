export interface GetRoomsData {
  name: string;
  userCount: number;
  max: number;
}

export type UserColor = "cyan" | "red" | "green" | "blue" | "yellow" | "orange" | "purple" | "grey";

export interface PlayerData {
  color: UserColor;
  username: string;
}

export interface RoomInfo {
  name: string;
  players: Array<PlayerData>;
  userCount: number;
  max: number;
  host: string;
}

export interface SocketKickData {
  username: string;
  room: string;
}

export type Callback = (success: boolean, data?: unknown) => void;
