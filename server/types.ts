export interface User {
  name: string;
}

export interface Room {
  name: string;
  users: User[];
}

export interface JoinRoomData {
  username: string;
  room: string;
}
