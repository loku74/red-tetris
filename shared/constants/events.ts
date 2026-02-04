// socket main events
export const EVENT_USER_DISCONNECT = "disconnecting";
export const EVENT_USER_CONNECT = "connect";
export const EVENT_USER_CONNECT_ERROR = "connect_error";

// join & leave events
export const EVENT_JOIN_ROOM = "join_room";
export const EVENT_LEAVE_ROOM = "leave_room";
export const EVENT_GET_ROOMS = "get_rooms";

// room events
export const EVENT_ROOM_UPDATE = "room_update";
export const EVENT_MESSAGE = "message";
export const EVENT_KICK = "kick";

// game
export const EVENT_GAME_START = "game_start";
export const EVENT_GAME_INFO = "game_info";
export const EVENT_GAME_SPECTRUM = "game_spectrum";
export const EVENT_GAME_PENALITY = "game_penality";
export const EVENT_GAME_FINISH = "game_finish";

// warm up
export const EVENT_WARMUP_START = "warmup_start";
export const EVENT_WARMUP_INFO = "warmup_info";
export const EVENT_WARMUP_FINISH = "warmup_finish";
