import { PieceColor } from "../../enums/colors";

export type EventMessagePayload = {
  message: string;
};

export type EventMessageSuccess = void;

export type EventMessageError = void;

export type EventMessageData = {
  from: string;
  color: PieceColor;
  message: string;
};
