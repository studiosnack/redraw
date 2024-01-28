import * as React from "react";
import { createSelector } from "@reduxjs/toolkit";

import { useAppSelector } from "../hooks";

import { selectCurrentCategoryId } from "../slices/appstate";
import { selectAddressableCategoryMap } from "../slices/categories";

const currentCategorySelector = createSelector(
  selectAddressableCategoryMap,
  selectCurrentCategoryId,
  (mapping, id) => mapping[id]
);

export function CategoryView() {
  const currentCategory = useAppSelector(currentCategorySelector);
  return <p>{currentCategory?.name ?? "hello"}</p>;
}
