import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

import { RootState } from "src/reducer";

import { customId, type NestedListOf } from "../utils";

export type AppState = {
  sideBarOpenedState: { [id: string]: boolean };
  wantsChildInput: { [id: string]: boolean };
  selectedRow?: string;
};

const initialState: AppState = {
  sideBarOpenedState: {},
  wantsChildInput: {},
  selectedRow: undefined,
};

export const appStateSlice = createSlice({
  name: "application",
  initialState: initialState,
  reducers: {
    toggleSidebarOpen: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.sideBarOpenedState[id] === true) {
        delete state.sideBarOpenedState[id];
      } else {
        state.sideBarOpenedState[id] = true;
      }
    },
    toggleWantsChildInput: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.wantsChildInput[id] === true) {
        delete state.wantsChildInput[id];
      } else {
        state.wantsChildInput[id] = true;
      }
    },
    toggleSelectedRow: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.selectedRow === id) {
        delete state.selectedRow;
      } else {
        state.selectedRow = id;
      }
    },
  },
});
