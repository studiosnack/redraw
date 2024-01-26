import type { TypedUseSelectorHook } from "react-redux";
import { useSelector, useDispatch } from "react-redux";

import type { AppDispatch, RootState } from "./reducer";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
