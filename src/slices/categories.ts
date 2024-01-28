import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

import { RootState } from "src/reducer";

import { customId, type NestedHierarchyOf, type NestedListOf } from "../utils";

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
  },
});

export const selectCategoryMap = (state: RootState) =>
  state.categories.categories;
export const selectAddressableCategoryMap = createSelector(
  selectCategoryMap,
  (catMap) => {
    return catMap.reduce((prev, curr) => {
      return { ...prev, [curr.id]: curr };
    }, {});
  }
);
export const selectCategoryOrdering = (state: RootState) =>
  state.categories.ordering;
const selectSpecificCategoryOrdering = (state: RootState, categoryId: string) =>
  state.categories.ordering[categoryId];

// get the number of immediate children of a category
export const selectCategoryChildCount = createSelector(
  selectSpecificCategoryOrdering,
  (categoryChildOrdering) => {
    return categoryChildOrdering?.length ?? 0;
  }
);
// find if a category has children at all
export const selectHasCategoryChildren = createSelector(
  selectCategoryChildCount,
  (count) => count > 0
);

export const selectCategoryById = createSelector(
  selectCategoryMap,
  (state: RootState, categoryId: string) => categoryId,
  (categoryMap: Category[], categoryId: string) => {
    return categoryMap.find((cat) => cat.id === categoryId);
  }
);

// return a nested list of lists suitable for rendering a Sidebar
export const selectResolvedCategoryList = createSelector(
  selectCategoryMap,
  selectCategoryOrdering,
  (categoryMap, categoryOrdering): NestedHierarchyOf<Category> => {
    function resolveOrdering<T>(
      ids: string[]
    ): Array<NestedHierarchyOf<Category> | Category> {
      return ids.map((id) => {
        const item = categoryMap.find((cat) => cat.id === id);
        return Array.isArray(categoryOrdering[id])
          ? [item, resolveOrdering(categoryOrdering[id])]
          : item;
      });
    }
    const resolvedList: NestedHierarchyOf<Category> = [
      { id: "root", name: "root", parentId: "null" },
      resolveOrdering(categoryOrdering["root"]),
    ];
    return resolvedList;
  }
);
