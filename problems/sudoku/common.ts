import type { Replace } from "../../utils/array.js";
import type { Increment } from "../../utils/math.js";
import type { Flatten } from "../../utils/objects.js";

/**
 * Track the valid digits we accept
 */
export type Digits = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
export type BoardValues = Digits | ".";

/**
 * Type with all the digits in an array for sorting
 */
export type AllDigits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Track the shape of the board
 */
export type Board = BoardValues[][];

/**
 * Tracking the remaining values counter
 */
export type RemainingCounter = {
  [key in string]: number;
};

/**
 * Track a position in the board
 */
export type BoardPosition<
  Row extends number = number,
  Column extends number = number
> = {
  row: Row;
  column: Column;
};

/**
 * Track the positions for any given value
 */
export type ValuePositions = {
  [key in string]: BoardPosition<any, any>[];
};

/**
 * Represent the current state
 */
export type State<
  Counter extends RemainingCounter = {},
  Placed extends ValuePositions = {}
> = {
  counter: Counter;
  placed: Placed;
};

/**
 * Hold the information about a digit valid rows and columns
 */
export type RowData<R extends number[] = number[]> = Flatten<
  {
    rows: R;
  } & {
    [key in number]: number[];
  }
>;

/**
 * The position graph shape for each digit
 */
export type PositionGraph = {
  [key in Digits]: RowData<any>;
};

/**
 * Update the board at the given position with a new value
 */
export type UpdateBoard<
  Current,
  Row extends number,
  Column extends number,
  Value extends BoardValues,
  R extends number = 0
> = Current extends [infer Next, ...infer Rest]
  ? R extends Row
    ? [Replace<Next, Column, Value>, ...Rest]
    : Rest extends never[]
    ? []
    : [Next, ...UpdateBoard<Rest, Row, Column, Value, Increment<R>>]
  : never;
