import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

import { RootState } from "src/reducer";

import {
  customId,
  keyBy,
  values,
  type NestedHierarchyOf,
  type NestedListOf,
} from "../utils";

export type Field = {
  label: string; // can be anything 'name', 'cost', 'url'
  categoryId?: string; // will limit values to descendants of a category
  value: string; // either a string of below type OR the id of an above category
  type: "string" | "number" | "currency" | "year" | "url" | "date" | "boolean";
  hidden?: boolean;
};

export type Item = {
  id: string;
  dateAdded: number; // Date().now()
  properties: Field[];
  schema?: {
    id: string;
  };
};

// schemas are useful to pre-populate fields in an item
export type Schema = {
  id: string;
  name: string;
  fields: Field[];
};

export type ItemState = {
  items: { [id: string]: Item };
  itemOrdering: string[];
  schemas: { [id: string]: Schema };
};

const initialItemState: ItemState = {
  items: {},
  itemOrdering: [],
  schemas: {},
};

export const itemsSlice = createSlice({
  name: "items",
  initialState: initialItemState,
  reducers: {
    addUnderCategory: {
      prepare: (parentId: string, name: string) => {
        return {
          payload: {
            id: customId(),
            dateAdded: Date.now(),
            properties: [
              {
                label: "Name",
                type: "string",
                value: name,
              },
              {
                label: "Category",
                type: "string",
                categoryId: parentId,
              },
            ],
          } as Item,
        };
      },
      reducer: (state, action: PayloadAction<Item>) => {
        const { id } = action.payload;
        state.items[id] = action.payload;
        state.itemOrdering.push(id);
        return state;
      },
    },
  },
});

export const selectItems = (state: RootState) => state.items.items;
export const selectItemsAsArray = createSelector(selectItems, (items) =>
  Object.values(items)
);

export const getItemName = (item: Item) => {
  return (
    item.properties.find((p) => p.label === "Name")?.value ??
    "Can't find item name"
  );
};
