// socket main events
export const EVENT_USER_DISCONNECT = "disconnecting";
export const EVENT_USER_CONNECT = "connect";
export const EVENT_USER_CONNECT_ERROR = "connect_error";

// join & leave events
export const EVENT_CAN_JOIN_ROOM = "can_join_room";
export const EVENT_JOIN_ROOM = "join_room";
export const EVENT_LEAVE_ROOM = "leave_room";
export const EVENT_GET_ROOMS = "get_rooms";

// room events
export const EVENT_ROOM_UPDATE = "room_update";
export const EVENT_MESSAGE = "message";
export const EVENT_KICK = "kick";
export const EVENT_WARM_UP = "warm_up";
export const EVENT_GAME_START = "game_start";
