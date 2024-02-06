import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "../reducer";

export type AppState = {
  sideBarOpenedState: { [id: string]: boolean };
  wantsChildInput: { [id: string]: boolean };
  selectedCategoryRow?: string;
  currentView?: "category" | "fit";
};

const initialState: AppState = {
  sideBarOpenedState: {},
  wantsChildInput: {},
  selectedCategoryRow: undefined,
  currentView: undefined,
};

export const appStateSlice = createSlice({
  name: "application",
  initialState: initialState,
  reducers: {
    openSidebar: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.currentView = "category";
      state.sideBarOpenedState[id] = true;
    },
    closeSidebar: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.currentView = "category";
      delete state.sideBarOpenedState[id];
    },
    // implicitly sidebar for categories
    toggleSidebarOpen: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.currentView = "category";
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
      state.currentView = "category";
      if (state.selectedCategoryRow === id) {
        delete state.selectedCategoryRow;
      } else {
        state.selectedCategoryRow = id;
      }
    },
    selectFitCategory: (state, action: PayloadAction<string>) => {
      state.currentView = "fit";
      const id = action.payload;
      state.selectedCategoryRow = id;
      // if (state.sideBarOpenedState[id] === true) {
      //   delete state.sideBarOpenedState[id];
      // } else {
      //   state.sideBarOpenedState[id] = true;
      // }
    },
  },
});

export const selectCurrentCategoryId = (state: RootState) =>
  state.application.selectedCategoryRow;
