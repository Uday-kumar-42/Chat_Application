import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    socket: null,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
    setSocket(state, action) {
      state.socket = action.payload ? action.payload.socket : null;
    },
    clearSocket(state) {
      state.socket = null;
    },
  },
});

export const { setUser, clearUser, setSocket, clearSocket } = userSlice.actions;

export default userSlice.reducer;
