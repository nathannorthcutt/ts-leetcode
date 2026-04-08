/**
 * https://leetcode.com/problems/two-sum/description/
 */

import type { Increment, Subtract } from "../utils/math.js";

/** Solve the two sums problem */
export type TwoSum<
  Values extends readonly number[],
  Target extends number
> = Values extends readonly [infer Next extends number, ...infer Rest extends readonly number[]]
  ? Rest extends readonly []
    ? "No valid solution, too few elements"
    : Subtract<Target, Next> extends infer K extends number
    ? SinglePassHashMap<Rest, Target, 1, { [key in K]: 0 }>
    : never
  : never;

/** Define our hashmap */
type HashMap = { [key: number]: number };

/**
 * Single pass through the data looking for matches
 */
type SinglePassHashMap<
  Values extends readonly number[],
  Target extends number,
  Idx extends number = 0,
  H extends HashMap = {}
> = Values extends readonly [infer Next extends number, ...infer Rest extends readonly number[]]
  ? Next extends keyof H
    ? [H[Next], Idx]
    : Rest extends readonly []
    ? "Exhausted all values, no valid solution"
    : Subtract<Target, Next> extends infer K extends number
    ? SinglePassHashMap<Rest, Target, Increment<Idx>, H & { [key in K]: Idx }>
    : never
  : never;
