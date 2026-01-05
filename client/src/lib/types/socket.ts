export interface SocketJoinRoomData {
  username: string;
  room: string;
}

export interface SocketLeaveRoomData {
  room: string;
}

export interface SocketKickData {
  username: string;
  room: string;
}

export interface SocketChatData {
  message: string;
  room: string;
}

export interface SocketStartData {
  room: string;
}
