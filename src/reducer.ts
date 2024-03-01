import { createListenerMiddleware, configureStore } from "@reduxjs/toolkit";
import { categorySlice, type CategoryState } from "./slices/categories";
import { appStateSlice, type AppState } from "./slices/appstate";
import { itemsSlice, type ItemState } from "./slices/items";
import { fitsSlice, type FitState } from "./slices/fits";

const listenerMiddleware = createListenerMiddleware();

const saveToStore = (val: { [key: string]: any }) => {
  // @ts-ignore
  window.electronAPI.storeSet(val);
};

// @ts-ignore i'll fill these types in later somehow
const saveToElectronStoreMiddleware = (midStore) => (next) => (action) => {
  const updatedState = next(action);
  saveToStore(midStore.getState());
  return updatedState;
};

// @ts-ignore
const saveBackToFileMiddleware = (midstore) => (next) => (action) => {
  const updatedState = next(action);
  // @ts-ignore
  window.electronAPI.sendDocumentToBeAutosaved(midstore.getState());
  return updatedState;
};

export const getReduxStore = (preloadedState?: {
  categories: CategoryState;
  application: AppState;
  items: ItemState;
  fits: FitState;
}) => {
  let store = configureStore({
    reducer: {
      categories: categorySlice.reducer,
      application: appStateSlice.reducer,
      items: itemsSlice.reducer,
      fits: fitsSlice.reducer,
    },
    preloadedState,
    // @ts-ignore
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware().prepend(saveBackToFileMiddleware);
    },
  });
  return store;
};

export type BaseStoreType = ReturnType<typeof getReduxStore>;
export type RootState = ReturnType<BaseStoreType["getState"]>;
export type AppDispatch = BaseStoreType["dispatch"];

// export type RootState = ReturnType<typeof baseReduxStore.getState>;
// export type AppDispatch = typeof baseReduxStore.dispatch;
