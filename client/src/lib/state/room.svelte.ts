import { PieceColor, type RoomData, type UserColor } from "@app/shared";

export const roomState = $state(<{ data: RoomData | null; joined: boolean; color: UserColor }>{
  data: null,
  joined: false,
  color: PieceColor.GREY
});

export const setRoomData = (data: RoomData) => {
  roomState.data = data;
};
