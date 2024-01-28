import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "../reducer";

export type AppState = {
  sideBarOpenedState: { [id: string]: boolean };
  wantsChildInput: { [id: string]: boolean };
  selectedCategoryRow?: string;
};

const initialState: AppState = {
  sideBarOpenedState: {},
  wantsChildInput: {},
  selectedCategoryRow: undefined,
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
      if (state.selectedCategoryRow === id) {
        delete state.selectedCategoryRow;
      } else {
        state.selectedCategoryRow = id;
      }
    },
  },
});

export const selectCurrentCategoryId = (state: RootState) =>
  state.application.selectedCategoryRow;
