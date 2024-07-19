/**
 * https://leetcode.com/problems/two-sum/description/
 */

import type { Increment, Subtract } from "../utils/numbers.js";

/** Solve the two sums problem */
export type TwoSum<
  Values extends number[],
  Target extends number
> = Values extends [infer Next extends number, ...infer Rest]
  ? Rest extends never[]
    ? "No valid solution, too few elements"
    : Rest extends number[]
    ? Subtract<Target, Next> extends infer K extends number
      ? SinglePassHashMap<Rest, Target, 1, { [key in K]: 0 }>
      : never
    : never
  : never;

/** Define our hashmap */
type HashMap = { [key: number]: number };

/**
 * Single pass through the data looking for matches
 */
type SinglePassHashMap<
  Values extends number[],
  Target extends number,
  Idx extends number = 0,
  H extends HashMap = {}
> = Values extends [infer Next extends number, ...infer Rest]
  ? Next extends keyof H
    ? [H[Next], Idx]
    : Rest extends never[]
    ? "Exhausted all values, no valid solution"
    : Rest extends number[]
    ? Subtract<Target, Next> extends infer K extends number
      ? SinglePassHashMap<Rest, Target, Increment<Idx>, H & { [key in K]: Idx }>
      : never
    : never
  : never;
