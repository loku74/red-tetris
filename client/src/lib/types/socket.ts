export interface SocketJoinRoomError {
  username?: string;
  room?: string;
}

export interface SocketJoinRoomData {
  username: string;
  room: string;
}

export interface SocketMessageData {
  from: string;
  message: string;
}

export type SocketGetRoomsResponse = { name: string; userCount: number; max: number }[];
