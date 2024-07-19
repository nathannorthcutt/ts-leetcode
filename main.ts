import type { TwoSum } from "./problems/1_twosum.js";

const ex1: TwoSum<[2, 7, 11, 15], 9> = [0, 1];

const ex2: TwoSum<[3, 2, 4], 6> = [1, 2];

const ex3: TwoSum<[3, 3], 6> = [0, 1];

const ex4: TwoSum<[1, 2, 3, 4, 5], 12> =
  "Exhausted all values, no valid solution";

const ex5: TwoSum<[-1, 2, -3], -1> = [1, 2];
