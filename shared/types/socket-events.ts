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
  [shared.EVENT_CHANGE_COLOR]: SocketEvent<
    shared.EventChangeColorPayload,
    shared.EventChangeColorSuccess,
    shared.EventChangeColorError
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
  [shared.EVENT_GAME_START]: SocketEvent<
    shared.EventStartPayload,
    shared.EventStartSuccess,
    shared.EventStartError
  >;
  [shared.EVENT_WARMUP_ACTION]: SocketEvent<
    shared.EventGameActionPayload,
    shared.EventGameActionSuccess,
    shared.EventGameActionError
  >;
  [shared.EVENT_GAME_ACTION]: SocketEvent<
    shared.EventGameActionPayload,
    shared.EventGameActionSuccess,
    shared.EventGameActionError
  >;
  [shared.EVENT_GAME_SPECTATE]: SocketEvent<
    shared.EventSpectatePayload,
    shared.EventSpectateSuccess,
    shared.EventSpectateError
  >;
  [shared.EVENT_GAME_RESET_SPECTATE]: SocketEvent<void, void, void>;
}

export interface ServerToClientEvents {
  [shared.EVENT_ROOM_UPDATE]: (data: shared.RoomData) => void;
  [shared.EVENT_KICK]: (data: shared.EventKickData) => void;
  [shared.EVENT_MESSAGE]: (data: shared.EventMessageData) => void;
  [shared.EVENT_WARMUP_INFO]: (data: shared.GameData) => void;
  [shared.EVENT_WARMUP_FINISH]: () => void;
  [shared.EVENT_GAME_START]: () => void;
  [shared.EVENT_GAME_COUNTDOWN]: (data: number) => void;
  [shared.EVENT_GAME_INFO]: (data: shared.GameData) => void;
  [shared.EVENT_GAME_PENALITY]: (data: shared.GameData) => void;
  [shared.EVENT_GAME_FINISH]: (data: shared.PlayerScore[]) => void;
  [shared.EVENT_GAME_SPECTRUM]: (data: shared.PlayerInfo[]) => void;
  [shared.EVENT_GAME_DEAD]: (data: shared.GameData) => void;
  [shared.EVENT_GAME_SPECTATE]: (data: shared.EventSpectateData) => void;
}
