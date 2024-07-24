import type {
  Board,
  BoardPosition,
  Digits,
  PositionGraph,
  RowData,
  State,
  UpdateBoard,
  ValuePositions,
} from "./common.js";
import type { BuildGraph } from "./graph.js";
import type { ExtractState, SortState } from "./state.js";
import type { CheckValidMove } from "./validation.js";

/**
 * Solve the Sudoku puzzle by extracting the state, building the candidate
 * graph, sorting the state entries and then filling the board using the
 * backgracking algorithm
 */
export type SudokuSolver<Current extends Board> =
  ExtractState<Current> extends infer InitialState extends State // Extract the initial state
    ? BuildGraph<
        Current,
        InitialState
      > extends infer Graph extends PositionGraph // Extract the possible position graph
      ? SortState<InitialState> extends infer Order extends Digits[]
        ? InitialState extends State<infer _, infer Positions>
          ? CrossHatchingBacktrack<Current, Graph, Positions, Order>
          : never
        : never
      : never
    : never;

/**
 * Implements a cross-hatching backtrack algorithm to try to fill rows and
 * columns for each digit until a solution is reached.
 */
type CrossHatchingBacktrack<
  Current extends Board,
  Graph extends PositionGraph,
  Positions extends ValuePositions,
  Order
> = Order extends [infer D extends Extract<keyof Graph, Digits>, ...infer Rest]
  ? Graph[D] extends infer CurrentDigit extends RowData
    ? CurrentDigit extends RowData<infer Rows>
      ? RecursiveBackfillDigit<
          D,
          Current,
          Graph,
          Positions,
          Positions[D],
          CurrentDigit,
          Rest,
          Rows
        > // Start filling
      : never // Bad row data
    : never // Bad graph
  : never; // Bad order

/**
 * Using the given digit and rows, fill candidates in order until a valid
 * solution is found, backtracking to the previous result if there is an invalid
 * solution from that point
 */
type RecursiveBackfillDigit<
  D extends Digits,
  Current extends Board,
  Graph extends PositionGraph,
  Positions extends ValuePositions,
  Placed extends BoardPosition[],
  Data extends RowData,
  RemainingDigits,
  Rows
> = Rows extends [infer Row extends number, ...infer RemainingRows]
  ? Data[Row] extends infer Columns extends number[]
    ? RecursiveBackfillRow<
        D,
        Current,
        Graph,
        Positions,
        Placed,
        Data,
        Row,
        RemainingDigits,
        RemainingRows,
        Columns
      >
    : never
  : never;

/**
 * This is the core part of the backtracking that evaluates columns in the given
 * row and recursively invokes the other types to try to "fill" the remainder of
 * the board.  If a solution is found, return it, else return an indicator there
 * is no solution
 */
type RecursiveBackfillRow<
  D extends Digits,
  Current extends Board,
  Graph extends PositionGraph,
  Positions extends ValuePositions,
  Placed extends BoardPosition[],
  Data extends RowData,
  Row extends number,
  RemainingDigits,
  RemainingRows,
  Columns
> = Columns extends [infer Column extends number, ...infer RemainingColumns]
  ? Current[Row][Column] extends "."
    ? CheckValidMove<Placed, Row, Column> extends true
      ? UpdateBoard<Current, Row, Column, D> extends infer Updated extends Board
        ? RemainingRows extends never[] // no more rows
          ? RemainingDigits extends never[]
            ? Updated
            : CrossHatchingBacktrack<
                Updated,
                Graph,
                Positions,
                RemainingDigits
              > extends infer Completed extends Board
            ? Completed
            : RemainingColumns extends never[]
            ? "No Solution"
            : RecursiveBackfillRow<
                D,
                Current,
                Graph,
                Positions,
                Placed,
                Data,
                Row,
                RemainingDigits,
                RemainingRows,
                RemainingColumns
              >
          : RecursiveBackfillDigit<
              D,
              Updated,
              Graph,
              Positions,
              [BoardPosition<Row, Column>, ...Placed],
              Data,
              RemainingDigits,
              RemainingRows
            > extends infer Completed extends Board
          ? Completed
          : RemainingColumns extends never[]
          ? "No Solution"
          : RecursiveBackfillRow<
              D,
              Current,
              Graph,
              Positions,
              Placed,
              Data,
              Row,
              RemainingDigits,
              RemainingRows,
              RemainingColumns
            >
        : never
      : RemainingColumns extends never[]
      ? false
      : RecursiveBackfillRow<
          D,
          Current,
          Graph,
          Positions,
          Placed,
          Data,
          Row,
          RemainingDigits,
          RemainingRows,
          RemainingColumns
        >
    : RemainingColumns extends never[]
    ? "No Solution"
    : RecursiveBackfillRow<
        D,
        Current,
        Graph,
        Positions,
        Placed,
        Data,
        Row,
        RemainingDigits,
        RemainingRows,
        RemainingColumns
      >
  : never;
