import type { Increment } from "../../utils/math.js";
import type { Flatten } from "../../utils/objects.js";
import type {
  AllDigits,
  Board,
  BoardPosition,
  Digits,
  State,
} from "./common.js";
import type { CheckNotUsed } from "./validation.js";

/**
 * Build the graph for processing candidate moves which are row/column pairings
 * for each digit based on the initial state of the board.  Essentially this is:
 *
 * for(row in rows) {
 *   for(column in columns) {
 *     if(validMove(row, column, state)) {
 *      digit.addCandidate(row, column)
 *     }
 *   }
 * }
 */
export type BuildGraph<
  Current extends Board,
  InitialState extends State,
  D = AllDigits
> = D extends [infer Next extends Digits, ...infer Rest]
  ? Rest extends never[]
    ? {
        [key in Next]: GetCandidates<Current, InitialState, Next>;
      }
    : Flatten<
        {
          [key in Next]: GetCandidates<Current, InitialState, Next>;
        } & BuildGraph<Current, InitialState, Rest>
      >
  : never;

/**
 * Get candidate placements for the given digit based on the initial state and board.
 */
type GetCandidates<
  Current extends Board,
  InitialState extends State,
  D extends Digits
> = InitialState extends State<infer _, infer Positions>
  ? Positions[D] extends infer Placed extends BoardPosition[]
    ? GetValidRows<Placed> extends infer Rows extends number[]
      ? GetValidColumns<Placed> extends infer Columns extends number[]
        ? Flatten<
            GetGraphPlacements<Current, Rows, Columns, Placed> & { rows: Rows }
          >
        : never
      : never
    : never
  : never;

/**
 * Get all valid placements for the rows and columns
 */
type GetGraphPlacements<
  Current extends Board,
  Rows,
  Columns extends number[],
  Placements extends BoardPosition[]
> = Rows extends [infer Next extends number, ...infer Rest]
  ? Rest extends never[]
    ? {
        [key in Next]: CheckNotUsed<Current, Next, Columns, Placements>;
      }
    : Flatten<
        {
          [key in Next]: CheckNotUsed<Current, Next, Columns, Placements>;
        } & GetGraphPlacements<Current, Rest, Columns, Placements>
      >
  : never;

/**
 * Find all valid rows based on what has been placed
 */
type GetValidRows<Placed, N extends number = 0> = N extends 9
  ? []
  : ContainsRow<Placed, N> extends true
  ? [...GetValidRows<Placed, Increment<N>>]
  : [N, ...GetValidRows<Placed, Increment<N>>];

/**
 * Find all valid columns based on what was placed
 */
type GetValidColumns<Placed, N extends number = 0> = N extends 9
  ? []
  : ContainsColumn<Placed, N> extends true
  ? [...GetValidColumns<Placed, Increment<N>>]
  : [N, ...GetValidColumns<Placed, Increment<N>>];

/**
 * Test if the Placed array contains the given row
 */
type ContainsRow<Placed, Row extends number> = Placed extends [
  infer Position extends BoardPosition,
  ...infer Rest
]
  ? Position extends BoardPosition<infer R, infer _>
    ? R extends Row
      ? true
      : Rest extends never[]
      ? false
      : ContainsRow<Rest, Row>
    : never
  : never;

/**
 * Test if the Placed array contains the given column
 */
type ContainsColumn<Placed, Column extends number> = Placed extends [
  infer Position extends BoardPosition,
  ...infer Rest
]
  ? Position extends BoardPosition<infer _, infer C>
    ? C extends Column
      ? true
      : Rest extends never[]
      ? false
      : ContainsColumn<Rest, Column>
    : never
  : never;
