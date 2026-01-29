export type EventKickPayload = {
  username: string;
};

export type EventKickSuccess = void;

export type EventKickError = Partial<EventKickPayload>;

export type EventKickData = {
  room: string;
};
