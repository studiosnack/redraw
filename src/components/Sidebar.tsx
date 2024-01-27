import * as React from "react";
import styled from "@emotion/styled";
import { css, cx } from "@emotion/css";

import type { NestedListOf, NestedHierarchyOf } from "../utils";
import { VStack } from "./Layout";

export const SidebarHeader = styled.h2`
  font-size: 12px;
  font-weight: bold;
`;

export type SidebarRowProps<T> = {
  item: T;
  // children?: T[];
  hasChildren?: boolean;
  childrenVisible?: boolean;
};

export const OrderedSidebarList = styled.ul`
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

export const OrderedListItem = styled.li`
  display: flex;
  font-size: 12px;
  flex: 1;
  // margin: 6px 0;

  &:last-child {
    margin-bottom: 0;
  }
`;
export const insetItem = css`
  padding-left: 14px;
`;
const doublyInsetItem = css`
  padding-left: 28px;
`;

export function SidebarItems<T>({
  className,
  items,
  parent,
  resolveId,
  childrenVisible,
  accessoryVisible,
  SidebarRow,
  BottomAccessory,
}: {
  className?: string;
  items: Array<T | NestedHierarchyOf<T>>;
  parent: T;
  resolveId?: (item: T) => string;
  childrenVisible?: (item: T) => boolean;
  accessoryVisible?: (item: T) => boolean;
  SidebarRow: React.ElementType<SidebarRowProps<T>>;
  BottomAccessory: React.ElementType<{ item: T }>;
}) {
  return (
    <OrderedSidebarList className={className}>
      {items.map((itemOrItems, _idx) => {
        const hasChildren =
          Array.isArray(itemOrItems) &&
          Array.isArray(itemOrItems[1]) &&
          itemOrItems[1].length > 0;

        let [item, children] = Array.isArray(itemOrItems)
          ? itemOrItems
          : [itemOrItems, undefined];

        const itemId = resolveId ? resolveId(item) : _idx;

        return (
          <React.Fragment key={itemId}>
            <OrderedListItem>
              <VStack>
                {SidebarRow != null && (
                  <SidebarRow item={item} hasChildren={hasChildren} />
                )}

                {hasChildren &&
                  (childrenVisible != null ? childrenVisible(item) : true) && (
                    <SidebarItems
                      className={cx()}
                      parent={item}
                      items={children}
                      resolveId={resolveId}
                      childenVisible={childrenVisible}
                      accessoryVisible={accessoryVisible}
                      SidebarRow={SidebarRow}
                      BottomAccessory={BottomAccessory}
                    />
                  )}
              </VStack>
            </OrderedListItem>
          </React.Fragment>
        );
      })}
      {BottomAccessory != null
        ? accessoryVisible?.(parent) && <BottomAccessory item={parent} />
        : null}
    </OrderedSidebarList>
  );
}

const ClearInput = styled.input`
  background: transparent;
  border: 1px solid var(--light-ui-icon-color);
  border-radius: 4px;
  padding: 2px;
  padding-left: 6px;
  font-size: 12px;
  height: 14px;
  margin: 2px 0 2px -5px;

  ::placeholder {
    font-size: 10px;
    padding: 2px 2px 2px 0px;
  }

  @media (prefers-color-scheme: dark) {
    border-color: var(--dark-ui-icon-color);
  }
`;

export function SidebarInput<T>(props: {
  onSubmit?: (value: string, item: T) => any;
  placeholder?: string;
  item: T;
  onKeyUp?: (evt: React.KeyboardEvent<HTMLInputElement>) => any;
}) {
  const { item, onSubmit, placeholder, ...restInputProps } = props;
  const [inputValue, setInputValue] = React.useState("");

  return (
    <form
      onSubmit={(evt) => {
        evt.preventDefault();
        setInputValue("");
        onSubmit?.(inputValue, item);
      }}
    >
      <ClearInput
        placeholder={placeholder}
        type="text"
        name=""
        value={inputValue}
        onChange={(evt) => {
          setInputValue(evt.currentTarget.value);
        }}
        {...restInputProps}
      />
    </form>
  );
}
