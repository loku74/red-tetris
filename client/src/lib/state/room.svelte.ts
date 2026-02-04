import type { RoomData } from "@app/shared";
import { Colors } from "@app/shared";

export const roomState = $state(<{ data: RoomData | null; joined: boolean; color: Colors }>{
  color: Colors.GREY,
  joined: false,
  data: null
});

export const setRoomData = (data: RoomData) => {
  roomState.data = data;
};
