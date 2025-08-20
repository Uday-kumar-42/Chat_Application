import userSlice from "./userSlice";
import roomSlice from "./roomSlice"
import {configureStore} from "@reduxjs/toolkit";

const store = configureStore({
    reducer : {
        user : userSlice,
        rooms : roomSlice
    }
})

export default store;
