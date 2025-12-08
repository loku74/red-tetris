export interface JoinRoomData {
  username: string;
  room: string;
}

export interface GetRoomsData {
  name: string;
  userCount: number;
  max: number;
}

export type Callback = (err: unknown, response?: unknown) => void;
