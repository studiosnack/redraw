import {
  createSlice,
  configureStore,
  PayloadAction,
  bindActionCreators,
  createListenerMiddleware,
  createSelector,
} from "@reduxjs/toolkit";

import { RootState } from "src/reducer";

import { customId, type NestedListOf } from "../utils";

export type Category = {
  id: string;
  parentId: string;
  name: string;
};

export type CategoryState = {
  categories: Category[];
  ordering: { [id: string]: string[] };
  sideBarOpenedState: { [id: string]: boolean };
};

const initialCategoryState: CategoryState = {
  categories: [],
  ordering: { root: [] },
  sideBarOpenedState: {},
};

export const categorySlice = createSlice({
  name: "categories",
  initialState: initialCategoryState,
  reducers: {
    add: {
      prepare: (name?: string, parentId?: string) => {
        return {
          payload: {
            name: name ?? "new category",
            parentId: parentId ?? "root",
            id: customId(),
          },
        };
      },
      reducer: (state, action: PayloadAction<Category>) => {
        state.categories.push(action.payload);
        const orderingForParent = state.ordering[action.payload.parentId];
        if (Array.isArray(orderingForParent)) {
          state.ordering[action.payload.parentId].push(action.payload.id);
        } else {
          state.ordering[action.payload.parentId] = [action.payload.id];
        }
      },
    },
    delete: (state, action: PayloadAction<{ id: string }>) => {
      const category = state.categories.find((c) => c.id === action.payload.id);
      if (!category) {
        console.error(`could not find requested category ${action.payload.id}`);
      }

      state.categories = state.categories.filter(
        (cat) => cat.id !== action.payload.id
      );
      state.ordering[category.parentId] = state.ordering[
        category.parentId
      ].filter((catId) => catId !== action.payload.id);

      state.ordering;
    },
    toggleOpen: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      if (state.sideBarOpenedState[id] === true) {
        delete state.sideBarOpenedState[id];
      } else {
        state.sideBarOpenedState[id] = true;
      }
    },
  },
});

const selectCategoryMap = (state: RootState) => state.categories.categories;
const selectCategoryOrdering = (state: RootState) => state.categories.ordering;
export const selectResolvedCategoryList = createSelector(
  selectCategoryMap,
  selectCategoryOrdering,
  (categoryMap, categoryOrdering): [Category, NestedListOf<Category>] => {
    function resolveOrdering<T>(ids: string[]): NestedListOf<Category> {
      return ids.map((id) => {
        const item = categoryMap.find((cat) => cat.id === id);
        return Array.isArray(categoryOrdering[id])
          ? [item, resolveOrdering(categoryOrdering[id])]
          : item;
      });
    }
    const resolvedList: [Category, NestedListOf<Category>] = [
      { id: "root", name: "root", parentId: "null" },
      resolveOrdering(categoryOrdering["root"]),
    ];
    return resolvedList;
  }
);
