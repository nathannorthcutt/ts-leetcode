# Solving Sudoku

This package is responsible for implementing the Sudoku Solver outlined
[here](https://www.geeksforgeeks.org/sudoku-backtracking-7/). The types are
broken down into the following general buckets:

1. Common - The shared understanding of the problem space
2. Graph - Set of types responsible for building the candidate graph
3. Solver - The actual backtracking algorithm
4. State - Utilities to extract the original board state
5. Validation - Utilities to check and generate valid moves

The proposed algorithm works by dividing the problem into a couple of phases:

1. Extract the current state for all used positions and counts for remaining
   positions for each digit
2. Building a candidate set of moves for each digit
3. Sorting the digits by fewest remaining positions first to improve pruning
4. Recursive backtracking through possible valid row/column combinations in the
   sorted digit order identified in the 3rd step.

On my machine this was taking around 600ms in total for the given problem though
you may find more or less expensive puzzles to solve. It should in theory work
for any valid sudoku puzzle...
