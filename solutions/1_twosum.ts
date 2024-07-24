import type { TwoSum } from "../problems/1_twosum.js";

// Below are a few test cases to verify the solution, add more if we find edge
// cases

export const ex1: TwoSum<[2, 7, 11, 15], 9> = [0, 1];

export const ex2: TwoSum<[3, 2, 4], 6> = [1, 2];

export const ex3: TwoSum<[3, 3], 6> = [0, 1];

export const ex4: TwoSum<[1, 2, 3, 4, 5], 12> =
  "Exhausted all values, no valid solution";

export const ex5: TwoSum<[-1, 2, -3], -1> = [1, 2];
