import * as React from "react";
import styled from "@emotion/styled";
import { css, cx } from "@emotion/css";

import { categorySlice, type Category } from "../slices/categories";

import { RootState } from "../reducer";
import { useAppDispatch, useAppSelector } from "../hooks";
import type { NestedListOf } from "../utils";

import { bindActionCreators } from "@reduxjs/toolkit";

const SidebarHeader = styled.h2`
  font-size: 12px;
  font-weight: bold;
`;

export function Sidebar<T>({
  className,
  sections,
}: {
  className?: string;
  sections: { title: string; items: [T, NestedListOf<T>] }[];
}) {
  return (
    <div className={className}>
      {sections.map((section) => {
        return (
          <React.Fragment key={section.title}>
            <SidebarHeader>{section.title}</SidebarHeader>
            <SidebarItems items={section.items[1]} parent={section.items[0]} />
          </React.Fragment>
        );
      })}
    </div>
  );
}

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

const OrderedSidebarList = styled.ul`
  display: flex;
  flex: 1;
  flex-flow: column;
  list-style: none;
  // margin: 6px 0 0;
  padding: 0;

  ul {
    padding-left: 1em;
  }
`;

const OrderedListItem = styled.li`
  display: flex;
  font-size: 12px;
  flex: 1;
  // margin: 6px 0;

  &:last-child {
    margin-bottom: 0;
  }
`;
const insetItem = css`
  padding-left: 14px;
`;
const doublyInsetItem = css`
  padding-left: 28px;
`;

function SidebarItems<T>({
  className,
  items,
  parent,
  resolveId = (x: T) => x?.id ?? "id",
  resolveLabel = (x: T) => x?.name ?? "label",
}: {
  className?: string;
  items: Array<[T, NestedListOf<T>] | T>;
  parent: T;
  resolveId?: (item: T) => string;
  resolveLabel?: (item: T) => string;
}) {
  const dispatch = useAppDispatch();
  const { add: addCategory, toggleOpen } = bindActionCreators(
    categorySlice.actions,
    dispatch
  );

  const [wantsNewChild, setWantsNewChild] = React.useState(false);
  const handleInputSubmit = (value: string, parentId: string) => {
    addCategory(value, parentId);
  };

  return (
    <OrderedSidebarList className={className}>
      {items.map((itemOrItems, idx) => {
        return (
          <SidebarItem
            key={resolveId(
              Array.isArray(itemOrItems) ? itemOrItems[0] : itemOrItems
            )}
            itemOrItems={itemOrItems}
            resolveLabel={resolveLabel}
            resolveId={resolveId}
          />
        );
      })}
      {wantsNewChild && (
        <OrderedListItem className={cx(insetItem)}>
          <SidebarInput
            onSubmit={handleInputSubmit}
            parentId={resolveId(parent)}
            placeholder={`add ${resolveLabel(parent)} category`}
          />
        </OrderedListItem>
      )}
    </OrderedSidebarList>
  );
}

const ClearInput = styled.input`
  background: transparent;
  border: 1px solid var(--light-ui-icon-color);
  border-radius: 4px;
  padding: 4px;
  ::placeholder {
    font-size: 10px;
    padding: 2px;
  }

  @media (prefers-color-scheme: dark) {
    border-color: var(--dark-ui-icon-color);
  }
`;

function SidebarInput({
  parentId,
  onSubmit,
  placeholder,
  onClose,
}: {
  parentId: string;
  onSubmit?: (categoryName: string, categoryParentId: string) => any;
  onClose?: () => any;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");

  return (
    <form
      onSubmit={(evt) => {
        evt.preventDefault();
        setInputValue("");
        onSubmit?.(inputValue, parentId);
      }}
    >
      <ClearInput
        placeholder={placeholder}
        type="text"
        name=""
        value={inputValue}
        onKeyUp={(evt) => {
          if (evt.key === "escape") {
            onClose?.();
          }
        }}
        onChange={(evt) => {
          setInputValue(evt.currentTarget.value);
        }}
      />
    </form>
  );
}

const categoryLabelRow = css`
  min-height: 24px;
`;
const CategoryLabel = styled.span`
  flex: 1;
`;

const HStack = styled.div`
  display: flex;
  flex-flow: row;
  flex: 1;
`;
const VStack = styled.div`
  display: flex;
  flex-flow: column;
  flex: 1;
`;

const Arrow = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 205 205"
    version="1.1"
  >
    <g id="Artboard1" transform="matrix(1,0,0,1,485.568,-43.7983)">
      <g transform="matrix(1.6212,0,0,1.6212,-713.003,-294.494)">
        <path d="M237.029,276.643C238.757,275.668 239.826,273.838 239.826,271.853C239.826,269.869 238.757,268.038 237.029,267.063L175.324,232.246C173.621,231.285 171.536,231.3 169.848,232.286C168.159,233.272 167.121,235.081 167.121,237.036L167.121,306.671C167.121,308.626 168.159,310.434 169.848,311.42C171.536,312.406 173.621,312.422 175.324,311.461L237.029,276.643Z" />
      </g>
    </g>
  </svg>
);

const EllipsisIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="12"
    height="12"
    viewBox="0 0 522 522"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M261 522C405.146 522 522 405.146 522 261C522 116.854 405.146 0 261 0C116.854 0 0 116.854 0 261C0 405.146 116.854 522 261 522ZM109 317C139.928 317 165 291.928 165 261C165 230.072 139.928 205 109 205C78.0721 205 53 230.072 53 261C53 291.928 78.0721 317 109 317ZM317 261C317 291.928 291.928 317 261 317C230.072 317 205 291.928 205 261C205 230.072 230.072 205 261 205C291.928 205 317 230.072 317 261ZM413 317C443.928 317 469 291.928 469 261C469 230.072 443.928 205 413 205C382.072 205 357 230.072 357 261C357 291.928 382.072 317 413 317Z"
    />
  </svg>
);

const IconButton = styled.button`
  border: none;
  padding: 0;
  background: none;
  display: flex;
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

const alignCenter = css`
  align-items: center;
`;

function SidebarItem<T>({
  itemOrItems,
  resolveId,
  resolveLabel,
}: {
  itemOrItems: T | [T, NestedListOf<T>];
  resolveId: (x: T) => string;
  resolveLabel: (x: T) => string;
}) {
  let children, item;
  const hasChildren = Array.isArray(itemOrItems);
  if (hasChildren) {
    [item, children] = itemOrItems;
  } else {
    item = itemOrItems;
  }
  const dispatch = useAppDispatch();
  const itemId = resolveId(item);
  const itemLabel = resolveLabel(item);

  const childrenVisible = useAppSelector(
    (state: RootState) => !!state.categories.sideBarOpenedState[itemId]
  );

  const { add: addCategory, toggleOpen } = bindActionCreators(
    categorySlice.actions,
    dispatch
  );

  const [wantsNewChild, setWantsNewChild] = React.useState(false);

  // this checks does the current item's id act as a parentId?
  // if so, it appears in the data
  // const hasChildren = (data[itemId]?.length ?? 0) > 0;
  return (
    <OrderedListItem>
      <VStack>
        <HStack
          className={cx(
            categoryLabelRow,
            alignCenter,
            !hasChildren && insetItem
          )}
        >
          {hasChildren && (
            <IconButton onClick={() => toggleOpen({ id: itemId })}>
              <Arrow
                className={cx(basicArrow, childrenVisible && rotatedArrow)}
              />
            </IconButton>
          )}
          <CategoryLabel>{itemLabel}</CategoryLabel>{" "}
          <IconButton
            onClick={async () => {
              // @ts-ignore
              const res = await window.electronAPI.showContextMenu(
                itemId,
                itemLabel,
                {
                  delete: categorySlice.actions.delete({ id: itemId }),
                },
                {
                  wantsNewChild: !wantsNewChild,
                }
              );
              if (res?.[1] != null && res[0] === "delete") {
                dispatch(res[1]);
              } else if (res[0] === "add-child") {
                setWantsNewChild(true);
              }
            }}
          >
            <EllipsisIcon className={ellipsisClass} />
          </IconButton>
        </HStack>
        {hasChildren && childrenVisible && (
          <SidebarItems
            className={cx()}
            parent={item}
            items={children}
            resolveId={resolveId}
            resolveLabel={resolveLabel}
          />
        )}
        {wantsNewChild && (
          <OrderedListItem className={doublyInsetItem}>
            <SidebarInput
              parentId={itemId}
              onSubmit={(name, parentId) => {
                addCategory(name, parentId);
                setWantsNewChild(false);
              }}
              onClose={() => setWantsNewChild(false)}
              placeholder={`add ${itemLabel} child`}
            />
          </OrderedListItem>
        )}
      </VStack>
    </OrderedListItem>
  );
}
