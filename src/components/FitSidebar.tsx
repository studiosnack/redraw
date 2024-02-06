import * as React from "react";

import { useAppDispatch, useAppSelector } from "../hooks";
import { appStateSlice } from "../slices/appstate";
import { bindActionCreators } from "@reduxjs/toolkit";

import { SidebarHeader, OrderedSidebarList, OrderedListItem } from "./Sidebar";
import { HStack, VStack } from "./Layout";
import { css, cx } from "@emotion/css";

const listItemStyle = css`
  line-height: 24px;
  margin: 0;
  flex: 1;
`;

// this is duped from categorysidebar.tsx
const selectedRowStyle = css`
  background-color: var(--light-theme-accent-color);
  border-radius: 4px;

  @media (prefers-color-scheme: dark) {
    background-color: var(--dark-theme-accent-color);
  }
`;

export const FitSidebar = () => {
  const dispatch = useAppDispatch();
  const selectedRow = useAppSelector(
    (state) => state.application.selectedCategoryRow
  );
  const { selectFitCategory } = bindActionCreators(
    appStateSlice.actions,
    dispatch
  );
  const handleSeeAllFits = () => selectFitCategory("root");

  const handleSeeLastWeekFits = () => selectFitCategory("lastweek");
  const handleSeePastFits = () => selectFitCategory("past");

  return (
    <OrderedSidebarList>
      <OrderedListItem>
        <VStack>
          <SidebarHeader
            className={cx(
              listItemStyle,
              selectedRow === "root" && selectedRowStyle
            )}
            tabIndex={0}
            onClick={handleSeeAllFits}
          >
            Fits
          </SidebarHeader>
          <OrderedSidebarList>
            <OrderedListItem
              className={cx(
                listItemStyle,
                selectedRow === "lastweek" && selectedRowStyle
              )}
              tabIndex={0}
              onClick={handleSeeLastWeekFits}
            >
              This week
            </OrderedListItem>
            <OrderedListItem
              className={cx(
                listItemStyle,
                selectedRow === "past" && selectedRowStyle
              )}
              tabIndex={0}
              onClick={handleSeePastFits}
            >
              The past
            </OrderedListItem>
          </OrderedSidebarList>
        </VStack>
      </OrderedListItem>
    </OrderedSidebarList>
  );
};
