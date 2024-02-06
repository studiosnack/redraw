import * as React from "react";
import styled from "@emotion/styled";
import { cx, css } from "@emotion/css";
import { bindActionCreators } from "@reduxjs/toolkit";

import type { Category } from "../slices/categories";
import {
  selectResolvedCategoryList,
  categorySlice,
  selectHasCategoryChildren,
} from "../slices/categories";
import { appStateSlice, selectCurrentCategoryId } from "../slices/appstate";

import { type RootState } from "../reducer";
import { useAppDispatch, useAppSelector } from "../hooks";

import {
  SidebarHeader,
  SidebarItems,
  insetItem,
  SidebarRowProps,
  OrderedListItem,
  SidebarInput,
} from "./Sidebar";
import { HStack, alignCenter } from "./Layout";

import { ArrowIcon, EllipsisIcon, IconButton } from "./Icons";

const categoryLabelRow = css`
  padding-right: 4px;
`;
const CategoryLabel = styled.span`
  flex: 1;
  line-height: 24px;
`;
const boldLabel = css`
  font-weight: bold;
`;

const selectedRowStyle = css`
  background-color: var(--light-theme-accent-color);
  border-radius: 4px;

  @media (prefers-color-scheme: dark) {
    background-color: var(--dark-theme-accent-color);
  }
`;

const basicArrow = css`
  width: 12px;
  height: 12px;
  margin-right: 2px;
  /* transform: translateY(-3px); */
  transition: all 160ms ease;

  & g {
    fill: var(--light-ui-icon-color);
  }

  @media (prefers-color-scheme: dark) {
    & g {
      fill: var(--dark-ui-icon-color);
    }
  }
`;
const rotatedArrow = css`
  transform: rotate(90deg);
`;

const ellipsisClass = css`
  opacity: 0;
  transition: opacity 80ms ease;

  div:hover > button > & {
    opacity: 1;
  }
  path {
    fill: var(--light-ui-icon-color);
  }

  @media (prefers-color-scheme: dark) {
    path {
      fill: var(--dark-ui-icon-color);
    }
  }
`;

function CategoryRow({ item, depth }: { item: Category; depth: number }) {
  const itemId = item.id;

  const dispatch = useAppDispatch();

  const { toggleWantsChildInput: setWantsNewChild } = bindActionCreators(
    appStateSlice.actions,
    dispatch
  );

  const wantsChildInputState = useAppSelector(
    (state) => state.application.wantsChildInput
  );

  const handleContextClick = async (item: Category) => {
    // @ts-ignore
    const res = await window.electronAPI.showContextMenu(
      item.id,
      item.name,
      {
        delete: categorySlice.actions.delete({ id: item.id }),
        moveSiblingsInto: categorySlice.actions.move({
          oldParentId: item.parentId,
          newParentId: item.id,
        }),
      },
      {
        wantsNewChild: !wantsChildInputState[item.id],
      }
    );
    if (res?.[1] != null && res[0] === "delete") {
      dispatch(res[1]);
    } else if (res?.[1] != null && res[0] === "move") {
      dispatch(res[1]);
    } else if (res[0] === "add-child") {
      setWantsNewChild(item.id);
    } else if (res[0] === "move") {
    }
  };

  const selectedRow = useAppSelector(selectCurrentCategoryId);
  const isSelected = selectedRow === itemId;
  const { toggleSidebarOpen: onToggle, toggleSelectedRow: setSelectedRow } =
    bindActionCreators(appStateSlice.actions, dispatch);

  const sideBarOpenedState = useAppSelector(
    (state: RootState) => state.application.sideBarOpenedState
  );

  const hasChildren = useAppSelector((state) =>
    selectHasCategoryChildren(state, itemId)
  );
  const childrenVisible = sideBarOpenedState[itemId];

  return (
    <HStack
      tabIndex={0}
      className={cx(
        categoryLabelRow,
        alignCenter,
        !hasChildren && insetItem,
        isSelected && selectedRowStyle
      )}
      onClick={() => setSelectedRow(itemId)}
      onKeyUp={(evt) => {
        if (evt.key === "ArrowRight" || evt.key === "ArrowLeft") {
          onToggle(itemId);
        }
      }}
      onKeyPress={() => setSelectedRow(itemId)}
    >
      {hasChildren && (
        <IconButton
          onClick={(evt) => {
            evt.stopPropagation();
            onToggle(itemId);
          }}
        >
          <ArrowIcon
            className={cx(basicArrow, childrenVisible && rotatedArrow)}
          />
        </IconButton>
      )}
      <CategoryLabel className={depth === 0 && boldLabel}>
        {item.name}
      </CategoryLabel>{" "}
      <IconButton
        onClick={(evt) => {
          evt.stopPropagation();
          handleContextClick(item);
        }}
      >
        <EllipsisIcon className={ellipsisClass} />
      </IconButton>
    </HStack>
  );
}

const AddCategoryAccessory = ({ item }: { item: Category }) => {
  const dispatch = useAppDispatch();
  const { add: addCategory } = bindActionCreators(
    categorySlice.actions,
    dispatch
  );
  const { toggleWantsChildInput } = bindActionCreators(
    appStateSlice.actions,
    dispatch
  );
  const handleInputSubmit = (value: string, item: Category) => {
    addCategory(value, item.id);
  };

  return (
    <OrderedListItem className={cx(insetItem)}>
      <SidebarInput
        onSubmit={handleInputSubmit}
        placeholder={
          // the root parent id is the string null, i'm sorry
          item.parentId !== "null"
            ? `add ${item.name} category`
            : "Add new category"
        }
        item={item}
        onKeyUp={(evt) => {
          evt.key === "Escape" &&
            item.id !== "root" &&
            toggleWantsChildInput(item.id);
        }}
      />
    </OrderedListItem>
  );
};

export function CategorySidebar({ className }: { className?: string }) {
  const categoryData = useAppSelector(selectResolvedCategoryList);
  const sideBarOpenedState = useAppSelector(
    (state: RootState) => state.application.sideBarOpenedState
  );
  const wantsChildInputState = useAppSelector(
    (state) => state.application.wantsChildInput
  );

  const doesItemHaveVisibleChildren = (item: Category) => {
    return sideBarOpenedState[item.id];
  };

  const itemWantsAccessory = (item: Category) => {
    return item.id === "root" || wantsChildInputState[item.id];
  };

  return (
    <div className={className}>
      {/* <SidebarHeader>Categories</SidebarHeader> */}
      <SidebarItems
        depth={0}
        items={categoryData[1]}
        parent={categoryData[0]}
        childrenVisible={doesItemHaveVisibleChildren}
        accessoryVisible={itemWantsAccessory}
        SidebarRow={CategoryRow}
        BottomAccessory={AddCategoryAccessory}
      />
    </div>
  );
}
