import { type UserColor } from "../user";

export type EventChangeColorPayload = {
  color: UserColor;
};

export type EventChangeColorSuccess = {
  color: UserColor;
};

export type EventChangeColorError = {
  room: string;
};
