export interface SocketJoinRoomData {
  username: string;
  roomName: string;
}

export interface SocketKickData {
  username: string;
}

export interface SocketChatData {
  message: string;
}
