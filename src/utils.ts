import { customAlphabet } from "nanoid";

export const customId = customAlphabet(
  "6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz",
  6
);

export type NestedListOf<T> = Array<T | NestedListOf<T>>;
export type NestedHierarchyOf<T> = [T, Array<NestedHierarchyOf<T> | T>];

export function keyBy<T extends { [k: string]: any }>(
  arr: T[],
  key: string
): { [key: string]: T } {
  return arr.reduce((prev, curr) => {
    if (curr[key] != null) {
      const keyVal = `${curr[key]}`;
      prev[keyVal] = curr;
      return prev;
    }
    return prev;
  }, {} as { [key: string]: T });
}

export function values<T extends { [key: string]: any }>(obj: T): T[] {
  return Object.values(obj);
}
