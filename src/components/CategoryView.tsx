import * as React from "react";
import { createSelector, bindActionCreators } from "@reduxjs/toolkit";
// import { useDispatch } from "react-redux";

import styled from "@emotion/styled";

import { useAppSelector, useAppDispatch } from "../hooks";

import { selectCurrentCategoryId } from "../slices/appstate";
import {
  selectAddressableCategoryMap,
  type Category,
} from "../slices/categories";

import { itemsSlice, selectItemsAsArray } from "../slices/items";
import { selectCurrentFit, fitsSlice } from "../slices/fits";

const currentCategorySelector = createSelector(
  selectAddressableCategoryMap,
  selectCurrentCategoryId,
  (mapping, id) => mapping[id]
);

const TitleBar = styled.div`
  -webkit-app-region: drag;
  background: var(--light-theme-titlebar-color);

  @media (prefers-color-scheme: dark) {
    background: var(--dark-theme-titlebar-color);
  }
`;
const CategoryHeader = styled.h3`
  font-weight: bold;
  font-size: 14px;
  margin-left: 1em;
`;
const CategoryBody = styled.div`
  background: var(--light-theme-body-color);
  flex: 1;

  @media (prefers-color-scheme: dark) {
    background: var(--dark-theme-body-color);
  }
`;

const selectItemsWithCurrentCategory = createSelector(
  selectItemsAsArray,
  currentCategorySelector,
  (items, category) => {
    if (!category) {
      return [];
    }
    return items.filter((item) => {
      return item.properties.some((prop) => prop.categoryId === category?.id);
    });
  }
);

export function CategoryView() {
  const dispatch = useAppDispatch();
  const currentCategory = useAppSelector(currentCategorySelector);
  const categoryItems = useAppSelector(selectItemsWithCurrentCategory);

  const currentFit = useAppSelector(selectCurrentFit);
  const { addItem: addToCurrentFit } = bindActionCreators(
    fitsSlice.actions,
    dispatch
  );

  return (
    <React.Fragment>
      <TitleBar>
        <CategoryHeader>
          {currentCategory?.name ?? <span>&nbsp;</span>}
        </CategoryHeader>
      </TitleBar>
      <CategoryBody>
        <ItemInput currentCategory={currentCategory} />
        <ul>
          {categoryItems.map((item) => {
            const nameProp = item.properties.find(
              ({ label }) => label === "Name"
            );
            return (
              <li key={item.id}>
                {nameProp.value}
                {currentFit && (
                  <button
                    onClick={() => {
                      // console.log(item.id, currentFit.id);
                      addToCurrentFit({
                        itemId: item.id,
                        fitId: currentFit.id,
                      });
                    }}
                  >
                    ({currentFit.items.includes(item.id) ? "-" : "+"})
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </CategoryBody>
    </React.Fragment>
  );
}

function ItemInput({ currentCategory }: { currentCategory?: Category }) {
  const dispatch = useAppDispatch();
  const [inputText, setInputText] = React.useState("");
  const handleSubmit = (evt: React.SyntheticEvent<HTMLFormElement>) => {
    evt.preventDefault();
    dispatch(
      itemsSlice.actions.addUnderCategory(currentCategory.id, inputText)
    );
    setInputText("");
  };
  if (currentCategory != null) {
    return (
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={(evt) => setInputText(evt.currentTarget.value)}
          style={{ margin: "20px 0 0 30px" }}
          placeholder={`Add a new item to ${currentCategory.name}`}
        />
      </form>
    );
  }
}
