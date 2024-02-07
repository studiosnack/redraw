import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

import { RootState } from "src/reducer";

import {
  customId,
  keyBy,
  values,
  type NestedHierarchyOf,
  type NestedListOf,
} from "../utils";

export type Fit = {
  id: string;
  name?: string;
  items: string[];
  notes?: string;
  dateAdded: number; // date this fit was created
  dateWorn?: number; // the date this outfit was worn
};

export type FitState = {
  log: Fit[];
};

const initialFitState: FitState = {
  log: [],
};

export const fitsSlice = createSlice({
  name: "fits",
  initialState: initialFitState,
  reducers: {
    addNew: {
      prepare: () => {
        return {
          payload: {
            id: customId(),
            name: "",
            items: [],
            dateAdded: Date.now(),
          } as Fit,
        };
      },
      reducer: (state, action: PayloadAction<Fit>) => {
        state.log.push(action.payload);
      },
    },
    addItem: (
      state,
      action: PayloadAction<{ itemId: string; fitId: string }>
    ) => {
      const { itemId, fitId } = action.payload;
      const idx = state.log.findIndex((fit) => fit.id === fitId);
      if (idx !== -1) {
        state.log[idx].items.push(itemId);
      }
    },
  },
});

const selectFits = (state: RootState) => state.fits.log;
const getSelectedAppRow = (state: RootState) =>
  state.application.selectedCategoryRow;
const getSelectedAppView = (state: RootState) => state.application.currentView;
const filterFitsByTypeAndAppContext = (
  fits: Fit[],
  selectedAppRow: string,
  currentAppView: RootState["application"]["currentView"]
): Fit[] => {
  if (currentAppView !== "fit") {
    return [];
  } else {
    switch (selectedAppRow) {
      case "root":
        return fits;
      case "lastweek":
        return fits.filter((f) => f.dateAdded >= Date.now() - 86400 * 7 * 1000);
      default:
        return fits;
    }
    if (selectedAppRow === "root") {
      return;
    }
  }
};
export const selectFitsBySelectedRow = createSelector(
  selectFits,
  getSelectedAppRow,
  getSelectedAppView,
  filterFitsByTypeAndAppContext
);
