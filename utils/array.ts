import type { Increment } from "./math.js";

/**
 * Replace the value in the array at the given index
 */
export type Replace<
  Arr,
  Idx extends number,
  T,
  N extends number = 0
> = Arr extends [infer Next, ...infer Rest]
  ? N extends Idx
    ? [T, ...Rest]
    : Rest extends never[]
    ? []
    : [Next, ...Replace<Rest, Idx, T, Increment<N>>]
  : never;
