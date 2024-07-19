import type {
  AscendingNumbers,
  DescendingNumbers,
  PositiveToNegative,
} from "./numberArrays.js";

/**
 * Test for a negative number
 */
export type IsNegative<N extends number> = `${N}` extends `-${number}`
  ? true
  : false;

/**
 * Get the ABS of a number
 */
export type Abs<N extends number> = `${N}` extends `-${infer A extends number}`
  ? A
  : N;

/**
 * "Increment" the number
 */
export type Increment<N extends number> = N extends keyof AscendingNumbers
  ? AscendingNumbers[N]
  : never;

/**
 * "Decrement" the number
 */
export type Decrement<N extends number> = N extends keyof DescendingNumbers
  ? DescendingNumbers[N]
  : never;

/**
 * Add two positive numbers
 */
type _Add<Left extends number, Right extends number> = Right extends 0
  ? Left
  : _Add<Increment<Left>, Decrement<Right>>;

/**
 * Subtract one positive number from the other positive number
 */
type _Subtract<Left extends number, Right extends number> = Right extends 0
  ? Left
  : Left extends 0
  ? PositiveToNegative[Right]
  : _Subtract<Decrement<Left>, Decrement<Right>>;

/**
 * Subtract the right number from the left
 */
export type Subtract<Left extends number, Right extends number> = [
  IsNegative<Left>
] extends [true]
  ? [IsNegative<Right>] extends [true]
    ? _Subtract<Abs<Right>, Abs<Left>> // -a - (-b) = b - a
    : _Add<Abs<Left>, Right> extends infer V extends keyof PositiveToNegative // -a - b = -(a + b)
    ? PositiveToNegative[V]
    : never
  : IsNegative<Right> extends true
  ? _Add<Left, Abs<Right>> // a - (-b) = a + b
  : _Subtract<Left, Right>; // a - b

/**
 * Add the right number to the left
 */
export type Add<
  Left extends number,
  Right extends number
> = IsNegative<Left> extends true
  ? IsNegative<Right> extends true
    ? _Add<Abs<Left>, Right> extends infer V extends keyof PositiveToNegative // -a + -b = -(a + b)
      ? PositiveToNegative[V]
      : never
    : _Subtract<Right, Abs<Left>> // -a + b = b - a
  : IsNegative<Right> extends true
  ? _Subtract<Left, Abs<Right>> // a + (-b) = a - b
  : _Add<Left, Right>; // a + b
