import { createListenerMiddleware, configureStore } from "@reduxjs/toolkit";
import { categorySlice, type CategoryState } from "./slices/categories";
import { appStateSlice, type AppState } from "./slices/appstate";

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

export const getReduxStore = (preloadedState?: {
  categories: CategoryState;
}) => {
  let store = configureStore({
    reducer: {
      categories: categorySlice.reducer,
      application: appStateSlice.reducer,
    },
    preloadedState,
    // @ts-ignore
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware().prepend(saveToElectronStoreMiddleware);
    },
  });
  return store;
};

export type BaseStoreType = ReturnType<typeof getReduxStore>;
export type RootState = ReturnType<BaseStoreType["getState"]>;
export type AppDispatch = BaseStoreType["dispatch"];

// export type RootState = ReturnType<typeof baseReduxStore.getState>;
// export type AppDispatch = typeof baseReduxStore.dispatch;
