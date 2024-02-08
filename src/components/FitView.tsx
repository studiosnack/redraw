import * as React from "react";
import { bindActionCreators } from "@reduxjs/toolkit";
import { useAppSelector, useAppDispatch } from "../hooks";
import { fitsSlice, selectFitsBySelectedRow, type Fit } from "../slices/fits";
import { selectItems, getItemName } from "../slices/items";
import styled from "@emotion/styled";

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

const rowMapping: { [key: string]: string } = {
  root: "Oufits",
  lastweek: "Last week's outfits",
  past: "Older outfits (archive)",
};
export function FitView() {
  const selectedRow = useAppSelector(
    ({ application }) => application.selectedCategoryRow
  );
  const dispatch = useAppDispatch();

  const fitsToShow = useAppSelector(selectFitsBySelectedRow);

  const { addNew: addNewFit } = bindActionCreators(fitsSlice.actions, dispatch);

  return (
    <React.Fragment>
      <TitleBar>
        <CategoryHeader>&nbsp; {rowMapping[selectedRow] ?? ""}</CategoryHeader>
      </TitleBar>
      <CategoryBody>
        <button onClick={addNewFit}>Add new fit for today</button>
        <ol>
          {fitsToShow.map((f) => (
            <li key={f.id}>
              <FitRow fit={f} />
            </li>
          ))}
        </ol>
      </CategoryBody>
    </React.Fragment>
  );
}

export function FitRow({ fit }: { fit: Fit }) {
  const items = useAppSelector(selectItems);

  const d = new Date(fit.dateAdded);
  return (
    <>
      <div>{d.toString()}</div>
      {fit.items.length === 0 ? (
        <p>no items yet</p>
      ) : (
        <ul>
          {fit.items.map((itemId) => {
            const item = items[itemId];
            if (item == null) {
              return <li>missing item {itemId}</li>;
            }
            return <li key={itemId}>{getItemName(item)}</li>;
          })}
        </ul>
      )}
    </>
  );
}
