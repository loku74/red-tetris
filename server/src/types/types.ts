// data (emit)
export type SocketUserColor =
  | "cyan"
  | "red"
  | "green"
  | "blue"
  | "yellow"
  | "orange"
  | "purple"
  | "grey";

export interface SocketPlayerData {
  color: SocketUserColor;
  username: string;
}

export interface SocketRoomInfoData {
  name: string;
  players: Array<SocketPlayerData>;
  userCount: number;
  max: number;
  host: string;
  playing: boolean;
  warmUpRestartDelay: number;
}

export interface SocketMessageData {
  from: string;
  message: string;
}

export type PieceType = "I" | "J" | "L" | "O" | "Z" | "T" | "S";
export type NonEmptyArray<T> = [T, ...T[]];
export type Matrix2D<T> = NonEmptyArray<NonEmptyArray<T>>

// responses (callback)
export type Callback = (success: boolean, data?: unknown) => void;

export interface SocketJoinRoomResponse {
  username?: string;
  roomName?: string;
}

export interface SocketGetRoomsResponse {
  name: string;
  userCount: number;
  max: number;
}

export interface SocketMessageResponse {
  from: string;
  color: SocketUserColor;
  message: string;
}
