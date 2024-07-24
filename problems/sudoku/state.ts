import type { Decrement, Increment } from "../../utils/math.js";
import type { Flatten } from "../../utils/objects.js";
import type { Sort } from "../../utils/sorting.js";
import type {
  AllDigits,
  Board,
  BoardPosition,
  Digits,
  RemainingCounter,
  State,
  ValuePositions,
} from "./common.js";

/**
 * Build the state given a {@link Board} by processing over the rows and columns
 */
export type ExtractState<
  Current extends Board,
  InitialState extends State = State,
  Row extends number = 0,
  Column extends number = 0
> = Column extends 9
  ? Row extends 9
    ? InitialState extends State<infer C, infer P>
      ? CheckState<C, P>
      : never
    : ExtractState<Current, InitialState, Increment<Row>, 0>
  : Current[Row][Column] extends infer D extends Digits
  ? ExtractState<
      Current,
      UpdateStatePosition<InitialState, D, Row, Column>,
      Row,
      Increment<Column>
    >
  : ExtractState<Current, InitialState, Row, Increment<Column>>;

/**
 * Sort the counters in the current state
 */
export type SortState<Current extends State> = Current extends State<
  infer Counters,
  infer _
>
  ? ExtractCounters<Counters, AllDigits> extends infer C extends CounterValues[]
    ? Sort<CounterValues, C, "value"> extends infer S extends CounterValues[]
      ? ExtractDigits<S>
      : AllDigits
    : never
  : never;

/**
 * Verify the state has all digit values present
 */
type CheckState<
  Counter extends RemainingCounter,
  Placed extends ValuePositions
> = Flatten<
  Counter & { [Key in MissingKeys<Extract<keyof Counter, Digits>>]: 9 }
> extends infer C extends RemainingCounter
  ? Flatten<
      Placed & { [Key in MissingKeys<Extract<keyof Placed, Digits>>]: [] }
    > extends infer P extends ValuePositions
    ? State<C, P>
    : never
  : never;

/**
 * Utility to find the missing keys
 */
type MissingKeys<CurrentKeys extends Digits> = {
  [Key in Digits]: Key extends CurrentKeys ? never : Key;
}[Digits];

/**
 * Update the state with the digit at the given position
 */
type UpdateStatePosition<
  InitialState extends State,
  Value extends Digits,
  Row extends number,
  Column extends number
> = InitialState extends State<infer C, infer P>
  ? Flatten<
      UpdateCounter<C, Value>
    > extends infer Counter extends RemainingCounter
    ? Flatten<
        AddPosition<P, Value, BoardPosition<Row, Column>>
      > extends infer Positions extends ValuePositions
      ? State<Counter, Positions>
      : never
    : never
  : never;

/**
 * Add the position to the correct state digit
 */
type AddPosition<
  Positions extends ValuePositions,
  Value extends Digits,
  P extends BoardPosition
> = {
  [Key in Digits]: [Key] extends [keyof Positions]
    ? [Value] extends [Key]
      ? [...Positions[Key], P]
      : Positions[Key]
    : [Value] extends [Key]
    ? [P]
    : [];
};

/**
 * Update the ocunter for the given digit
 */
type UpdateCounter<Counter extends RemainingCounter, Value extends Digits> = {
  [Key in Digits]: [Key] extends [keyof Counter]
    ? [Value] extends [Key]
      ? Decrement<Counter[Key]>
      : Counter[Key]
    : [Value] extends [Key]
    ? 8
    : 9;
};

/**
 * Defines a counter value
 */
type CounterValues<D extends Digits = Digits, V extends number = number> = {
  digit: D;
  value: V;
};

/**
 * Extract the current counters from the state
 */
type ExtractCounters<
  Counter extends RemainingCounter,
  Values
> = Values extends [infer Next extends Digits, ...infer Rest]
  ? Rest extends never[]
    ? [CounterValues<Next, Counter[Next]>]
    : [CounterValues<Next, Counter[Next]>, ...ExtractCounters<Counter, Rest>]
  : never;

/**
 * Retrieve the digits from the counter values
 */
type ExtractDigits<V extends CounterValues[]> = V extends [
  infer Next extends CounterValues,
  ...infer Rest
]
  ? Rest extends never[]
    ? [Next["digit"]]
    : Rest extends CounterValues[]
    ? [Next["digit"], ...ExtractDigits<Rest>]
    : never
  : never;
