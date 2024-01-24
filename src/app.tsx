import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import styled from "@emotion/styled";
import { css, cx } from "@emotion/css";

import { Provider, useDispatch, useSelector } from "react-redux";

import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz", 6);

const saveToStore = (val: { [key: string]: any }) => {
  // @ts-ignore
  window.electronAPI.storeSet(val);
};

import {
  createSlice,
  configureStore,
  PayloadAction,
  bindActionCreators,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

const listenerMiddleware = createListenerMiddleware();
type Category = {
  id: string;
  parentId: string;
  name: string;
};

type CategoryState = {
  categories: Category[];
  ordering: { [id: string]: string[] };
  sideBarOpenedState: { [id: string]: boolean };
};

const initialCategoryState: CategoryState = {
  categories: [],
  ordering: { root: [] },
  sideBarOpenedState: {},
};

const categorySlice = createSlice({
  name: "categories",
  initialState: initialCategoryState,
  reducers: {
    add: {
      prepare: (name?: string, parentId?: string) => {
        return {
          payload: {
            name: name ?? "new category",
            parentId: parentId ?? "root",
            id: nanoid(),
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

export const getReduxStore = (preloadedState?: {
  categories: CategoryState;
}) => {
  let store = configureStore({
    reducer: {
      categories: categorySlice.reducer,
    },
    preloadedState,
    // @ts-ignore
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware().prepend(
        (midStore) => (next) => (action) => {
          const updatedState = next(action);
          saveToStore(midStore.getState());
          return updatedState;
        }
      );
    },
  });
  return store;
};
// @ts-ignore
let baseReduxStore = getReduxStore();

export type RootState = ReturnType<typeof baseReduxStore.getState>;
export type AppDispatch = typeof baseReduxStore.dispatch;

const CategoryHeader = styled.h2`
  font-size: 12px;
  font-weight: bold;
`;

function CatList() {
  const dispatch = useDispatch();
  const { add: addCategory, delete: deleteCategory } = bindActionCreators(
    categorySlice.actions,
    dispatch
  );

  return (
    <div>
      <CategoryHeader>Categories</CategoryHeader>
      <CatItems parentId={"root"} />
    </div>
  );
}

const OrderedSidebarList = styled.ul`
  display: flex;
  flex: 1;
  flex-flow: column;
  list-style: none;
  margin: 0;
  margin: 6px 0;
  padding: 0;

  ul {
    padding-left: 1em;
  }
`;

const OrderedListItem = styled.li`
  display: flex;
  font-size: 12px;
  flex: 1;
  margin: 6px 0;
`;
const insetItem = css`
  padding-left: 14px;
`;

function CatItems({
  parentId,
  className,
}: {
  parentId: string;
  className?: string;
}) {
  const dispatch = useDispatch();
  const { categories, ordering: categoryOrdering } = useSelector(
    (state: RootState) => state.categories
  );
  const [inputValue, setInputValue] = React.useState("");

  const { add: addCategory, delete: deleteCategory } = bindActionCreators(
    categorySlice.actions,
    dispatch
  );
  const parent = categories.find((c) => c.id === parentId) ?? { name: "root" };

  return (
    <OrderedSidebarList className={className}>
      {categoryOrdering[parentId].map((categoryId) => {
        const cat = categories.find((c) => c.id === categoryId);
        if (!cat) {
          return (
            <span key={categoryId}>missing category with id {categoryId}</span>
          );
        } else {
          return <CatItem key={categoryId} cat={cat} />;
        }
      })}
      <OrderedListItem className={cx(insetItem)}>
        <CatInput
          parentId={parentId}
          placeholder={`add ${parent.name} category`}
        />
      </OrderedListItem>
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

function CatInput({
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

const ellipsisClass = css`
  path {
    fill: var(--light-ui-icon-color);
  }

  @media (prefers-color-scheme: dark) {
    path {
      fill: var(--dark-ui-icon-color);
    }
  }
`;

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

function CatItem({ cat }: { cat: Category }) {
  const dispatch = useDispatch();
  const { categories, ordering: categoryOrdering } = useSelector(
    (state: RootState) => state.categories
  );
  const childrenVisible = useSelector(
    (state: RootState) => !!state.categories.sideBarOpenedState[cat.id]
  );
  const {
    add: addCategory,
    delete: deleteCategory,
    toggleOpen,
  } = bindActionCreators(categorySlice.actions, dispatch);

  const [wantsNewChild, setWantsNewChild] = React.useState(false);
  // const [childrenVisible, setChildrenVisible] = React.useState(true);
  // const toggleChildren = () => setChildrenVisible((v) => !v);

  const hasChildren = (categoryOrdering[cat.id]?.length ?? 0) > 0;
  return (
    <OrderedListItem>
      <VStack>
        <HStack className={cx(alignCenter, !hasChildren && insetItem)}>
          {hasChildren && (
            <IconButton onClick={() => toggleOpen({ id: cat.id })}>
              <Arrow
                className={cx(basicArrow, childrenVisible && rotatedArrow)}
              />
            </IconButton>
          )}
          <CategoryLabel>{cat.name}</CategoryLabel>{" "}
          <IconButton
            onClick={async () => {
              // @ts-ignore
              const res = await window.electronAPI.showContextMenu(
                cat.id,
                {
                  delete: categorySlice.actions.delete({ id: cat.id }),
                },
                {
                  wantsNewChild: !hasChildren && !wantsNewChild,
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
        {hasChildren
          ? childrenVisible && <CatItems className={cx()} parentId={cat.id} />
          : wantsNewChild && (
              <OrderedSidebarList>
                <OrderedListItem>
                  <CatInput
                    parentId={cat.id}
                    onSubmit={(name, parentId) => {
                      addCategory(name, parentId);
                      setWantsNewChild(false);
                    }}
                    onClose={() => setWantsNewChild(false)}
                  />
                </OrderedListItem>
              </OrderedSidebarList>
            )}
      </VStack>
    </OrderedListItem>
  );
}

const AppShell = styled.div`
  display: flex;
  height: 100%;
`;
const SidebarContainer = styled.div`
  width: 200px;
  padding: 1em;
  margin-top: 1em;
  -webkit-user-select: none;
`;
const MainContentContainer = styled.div`
  -webkit-app-region: drag;
  background: white;
  display: flex;
  justify-self: stretch;
  flex: 1;
`;

export const App = ({ reduxStore }: { reduxStore: typeof baseReduxStore }) => {
  return (
    <Provider store={reduxStore}>
      <AppShell>
        <SidebarContainer>
          <CatList />
        </SidebarContainer>
        <MainContentContainer />
      </AppShell>
    </Provider>
  );
};
