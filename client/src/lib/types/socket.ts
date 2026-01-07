export interface SocketJoinRoomData {
  username: string;
  roomName: string;
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
}

export interface SocketStartData {
  room: string;
}
