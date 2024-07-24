import type { Add, Increment } from "../../utils/math.js";
import type { Board, BoardPosition } from "./common.js";

/**
 * Verify which row/column combinations are valid moves and not already taken by
 * another digit.  This includes no other positions in the submatrix (3x3) pairing
 * with the same digit.  The row/column filtering is done in the graph builder
 * so we skip it here
 */
export type CheckNotUsed<
  Current extends Board,
  Row extends number,
  Columns,
  Placements extends BoardPosition[]
> = Columns extends [infer Next extends number, ...infer Rest]
  ? Current[Row][Next] extends "."
    ? CheckValidMove<Placements, Row, Next> extends true
      ? Rest extends []
        ? [Next]
        : [Next, ...CheckNotUsed<Current, Row, Rest, Placements>]
      : Rest extends []
      ? []
      : [...CheckNotUsed<Current, Row, Rest, Placements>]
    : Rest extends []
    ? []
    : [...CheckNotUsed<Current, Row, Rest, Placements>]
  : never;

/**
 * Verify if a current move is valid with the given state
 */
export type CheckValidMove<
  Placed extends BoardPosition[],
  Row extends number,
  Column extends number
> = SubMatrixPositions[SubMatrixMap[Row]][SubMatrixMap[Column]] extends infer SubMatrix extends BoardPosition[]
  ? SubMatrixContains<SubMatrix, Placed> extends true // Check if we already have something placed in submatrix
    ? "already placed"
    : RowColumnCollision<Placed, Row, Column> extends true // Check if we have a row or column restriction
    ? "row/column collision"
    : true
  : never;

/**
 * Type to check if a row or column is already used by this digit
 */
type RowColumnCollision<
  Positions,
  Row extends number,
  Column extends number
> = Positions extends [infer Position extends BoardPosition, ...infer Rest]
  ? Position extends BoardPosition<infer R, infer C>
    ? R extends Row
      ? true
      : C extends Column
      ? true
      : Rest extends never[]
      ? false
      : RowColumnCollision<Rest, Row, Column>
    : never
  : never;

/**
 * Type to verify if the submatrix already contains a position
 */
type SubMatrixContains<SubMatrix, Positions> = Positions extends [
  infer Position extends BoardPosition,
  ...infer Rest
]
  ? Position extends BoardPosition<infer R, infer C>
    ? Contains<SubMatrix, R, C> extends true
      ? true
      : Rest extends never[]
      ? false
      : SubMatrixContains<SubMatrix, Rest>
    : never
  : never;

/**
 * Type to check if the placed array contains the given item
 */
type Contains<
  Placed,
  Row extends number,
  Column extends number
> = Placed extends [infer Position extends BoardPosition, ...infer Rest]
  ? Position extends BoardPosition<infer R, infer C>
    ? R extends Row
      ? C extends Column
        ? true
        : Rest extends never[]
        ? false
        : Contains<Rest, Row, Column>
      : Rest extends never[]
      ? false
      : Contains<Rest, Row, Column>
    : never
  : never;

/**
 * Utility type to build a SubMatrix map of all board positions in that matrix
 */
type BuildSubMatrix<
  Row extends number,
  Column extends number,
  R extends number = 0,
  C extends number = 0
> = R extends 3
  ? []
  : C extends 3
  ? BuildSubMatrix<Row, Column, Increment<R>, 0>
  : Add<Row, R> extends infer NR extends number
  ? Add<Column, C> extends infer NC extends number
    ? [BoardPosition<NR, NC>, ...BuildSubMatrix<Row, Column, R, Increment<C>>]
    : never
  : never;

/**
 * Get the positions for each board sub-matrix
 */
type SubMatrixPositions = [
  [BuildSubMatrix<0, 0>, BuildSubMatrix<0, 3>, BuildSubMatrix<0, 6>],
  [BuildSubMatrix<3, 0>, BuildSubMatrix<3, 3>, BuildSubMatrix<3, 6>],
  [BuildSubMatrix<6, 0>, BuildSubMatrix<6, 3>, BuildSubMatrix<6, 6>]
];

/**
 * Type to get the sub-matrix location for a key/value (div by 3)
 */
type SubMatrixMap = [0, 0, 0, 1, 1, 1, 2, 2, 2];
