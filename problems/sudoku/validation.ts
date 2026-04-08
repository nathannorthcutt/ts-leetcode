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
 * Pre-computed sub-matrix positions (eliminates recursive BuildSubMatrix + Add calls)
 */
type SubMatrixPositions = [
  [
    [BoardPosition<0,0>, BoardPosition<0,1>, BoardPosition<0,2>, BoardPosition<1,0>, BoardPosition<1,1>, BoardPosition<1,2>, BoardPosition<2,0>, BoardPosition<2,1>, BoardPosition<2,2>],
    [BoardPosition<0,3>, BoardPosition<0,4>, BoardPosition<0,5>, BoardPosition<1,3>, BoardPosition<1,4>, BoardPosition<1,5>, BoardPosition<2,3>, BoardPosition<2,4>, BoardPosition<2,5>],
    [BoardPosition<0,6>, BoardPosition<0,7>, BoardPosition<0,8>, BoardPosition<1,6>, BoardPosition<1,7>, BoardPosition<1,8>, BoardPosition<2,6>, BoardPosition<2,7>, BoardPosition<2,8>]
  ],
  [
    [BoardPosition<3,0>, BoardPosition<3,1>, BoardPosition<3,2>, BoardPosition<4,0>, BoardPosition<4,1>, BoardPosition<4,2>, BoardPosition<5,0>, BoardPosition<5,1>, BoardPosition<5,2>],
    [BoardPosition<3,3>, BoardPosition<3,4>, BoardPosition<3,5>, BoardPosition<4,3>, BoardPosition<4,4>, BoardPosition<4,5>, BoardPosition<5,3>, BoardPosition<5,4>, BoardPosition<5,5>],
    [BoardPosition<3,6>, BoardPosition<3,7>, BoardPosition<3,8>, BoardPosition<4,6>, BoardPosition<4,7>, BoardPosition<4,8>, BoardPosition<5,6>, BoardPosition<5,7>, BoardPosition<5,8>]
  ],
  [
    [BoardPosition<6,0>, BoardPosition<6,1>, BoardPosition<6,2>, BoardPosition<7,0>, BoardPosition<7,1>, BoardPosition<7,2>, BoardPosition<8,0>, BoardPosition<8,1>, BoardPosition<8,2>],
    [BoardPosition<6,3>, BoardPosition<6,4>, BoardPosition<6,5>, BoardPosition<7,3>, BoardPosition<7,4>, BoardPosition<7,5>, BoardPosition<8,3>, BoardPosition<8,4>, BoardPosition<8,5>],
    [BoardPosition<6,6>, BoardPosition<6,7>, BoardPosition<6,8>, BoardPosition<7,6>, BoardPosition<7,7>, BoardPosition<7,8>, BoardPosition<8,6>, BoardPosition<8,7>, BoardPosition<8,8>]
  ]
];

/**
 * Type to get the sub-matrix location for a key/value (div by 3)
 */
type SubMatrixMap = [0, 0, 0, 1, 1, 1, 2, 2, 2];
