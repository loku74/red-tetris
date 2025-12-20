export const kickState = $state({ room: "", show: false });

export const setKickedRoom = (room: string) => {
  kickState.room = room;
};

export const setKickedDialog = (show: boolean) => {
  kickState.show = show;
};
