angular_sudoku
==============

Sudoku game built with angular.js

The algorithm for solving the grid:

  1. updates cell possibilities.
  2. fill cells with unique values.
  3. if grid updated, go back to (1.) else go to (4.)
  4. backtrack algorithm (does not try the possibilities one by one, instead randomly choose possibilities).

Check out this live example http://mourafiq.com/angular_sudoku/
