export interface SocketJoinRoomError {
  username?: string;
  room?: string;
}

export interface SocketJoinRoomResponse {
  success: boolean;
  message?: string;
}

export interface SocketGetRoomsResponse {
  rooms: { name: string; userCount: number; max: number }[];
}
