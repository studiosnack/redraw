import { customAlphabet } from "nanoid";

export const customId = customAlphabet(
  "6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz",
  6
);

export type NestedListOf<T> = Array<T | NestedListOf<T>>;
