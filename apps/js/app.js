var Sudoku = angular.module('Sudoku', ['ngResource'],function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}'); }
	); 