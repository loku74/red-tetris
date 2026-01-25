import type { UserColor } from "../user";

export type EventMessagePayload = {
  message: string;
};

export type EventMessageSuccess = void;

export type EventMessageError = {
  room?: string;
};

export type EventMessageData = {
  from: string;
  color: UserColor;
  message: string;
};
