import * as shared from "../index";

type SuccessResponse<SuccessType> = SuccessType extends void
  ? { success: true }
  : { success: true; data: SuccessType };

type ErrorResponse<ErrorType> = ErrorType extends void
  ? { success: false }
  : { success: false; error: ErrorType };

export type SocketResponse<SuccessType = void, ErrorType = void> =
  | SuccessResponse<SuccessType>
  | ErrorResponse<ErrorType>;

export type SocketEvent<Payload = void, SuccessType = void, ErrorType = void> = Payload extends void
  ? (callback: (response: SocketResponse<SuccessType, ErrorType>) => void) => void
  : (
      payload: Payload,
      callback: (response: SocketResponse<SuccessType, ErrorType>) => void
    ) => void;

export interface ClientToServerEvents {
  [shared.EVENT_GET_ROOMS]: SocketEvent<
    shared.EventGetRoomsPayload,
    shared.EventGetRoomsSuccess,
    shared.EventGetRoomsError
  >;
  [shared.EVENT_JOIN_ROOM]: SocketEvent<
    shared.EventJoinRoomPayload,
    shared.EventJoinRoomSuccess,
    shared.EventJoinRoomError
  >;
  [shared.EVENT_MESSAGE]: SocketEvent<
    shared.EventMessagePayload,
    shared.EventMessageSuccess,
    shared.EventMessageError
  >;
  [shared.EVENT_KICK]: SocketEvent<
    shared.EventKickPayload,
    shared.EventKickSuccess,
    shared.EventKickError
  >;
  [shared.EVENT_LEAVE_ROOM]: SocketEvent<
    shared.EventLeaveRoomPayload,
    shared.EventLeaveRoomSuccess,
    shared.EventLeaveRoomError
  >;
  [shared.EVENT_GAME_START]: SocketEvent<
    shared.EventStartPayload,
    shared.EventStartSuccess,
    shared.EventStartError
  >;
  [shared.EVENT_WARMUP_START]: SocketEvent<
    shared.EventWarmUpPayload,
    shared.EventWarmUpSuccess,
    shared.EventWarmUpError
  >;
}

export interface ServerToClientEvents {
  [shared.EVENT_ROOM_UPDATE]: (data: shared.RoomData) => void;
  [shared.EVENT_KICK]: (data: shared.EventKickData) => void;
  [shared.EVENT_MESSAGE]: (data: shared.EventMessageData) => void;
  [shared.EVENT_GAME_START]: (data: shared.EventStartData) => void;
}
