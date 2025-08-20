import { createSlice } from "@reduxjs/toolkit";

const roomSlice = createSlice({
  name: "rooms",
  initialState: {
    rooms: [],
  },
  reducers: {
    addRoom(state, action) {
      const roomId = action.payload.roomId;

      // prevent duplicate rooms from being added
      if (state.rooms.some((room) => room.roomId === roomId)) {
        return;
      }

      state.rooms = [action.payload, ...state.rooms];
    },
    deleteRoom(state, action) {
      const roomId = action.payload.roomId;
      // Filter out the room to be deleted
      state.rooms = state.rooms.filter((room) => room.roomId !== roomId);
    },
    incrementUserCount(state, action) {
      const roomId = action.payload.roomId;
      const userCount = action.payload.userCount;
      const newMember = action.payload.newMember;

      state.rooms = state.rooms.map((room) =>
        room.roomId === roomId
          ? { ...room, userCount, members: [...room.members, newMember] }
          : room
      );
    },
  },
});

export const { addRoom, incrementUserCount, deleteRoom } = roomSlice.actions;

export default roomSlice.reducer;
