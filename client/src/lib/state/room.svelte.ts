import type { RoomData, UserColor } from "@app/shared";

export const roomState = $state(<{ data: RoomData | null; joined: boolean; color: UserColor }>{
  color: "grey",
  joined: false,
  data: null
});

export const setRoomData = (data: RoomData) => {
  roomState.data = data;
};
