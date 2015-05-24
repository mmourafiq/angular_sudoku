Sudoku.controller('SudokuController', function SudokuController($scope, data) {
	'use strict';

	$scope.rows = angular.copy(data);	
	$scope.rows_save = angular.copy(data);	
	$scope.current_possibilities = [];

    /**
     * Creates an empty grid.
     */
	function createEmptyRows() {
		var rows = angular.copy(data);
		for (var l=0; l<9; l++)
			for(var c=0; c<9; c++){
				rows[l].columns[c].value = "";
				rows[l].columns[c].class = "";
			}
		return rows;
	}

    /**
     * Checks if the current grid is solved.
     */
	function isSolved(rows)
	{
		for(var i = 0; i < 9; i++)
			for(var k=0; k<9; k++)
				if(rows[i].columns[k].value === "")
					return false;
		return true;
	}

    /**
     * Checks and changes the class of the current cell.
     */
	function changeClass(old_class, new_class) {
        if (old_class === "correct")
        	return old_class;
        else
        	return new_class;        
    }

    /**
     * Returns the max and min values of row/column based on coordinates.
     *
     *  e.g. rowId = 5, columnId = 4
     *  x x x | x x x | x x x
     *  x x x | x x x | x x x
     *  x x x | x x x | x x x
     *  - - -   - - -   - - -
     *  x x x | x x x | x x x
     *  x x x | x x x | x x x
     *  x x x | x 0 x | x x x
     *  - - -   - - -   - - -
     *  x x x | x x x | x x x
     *  x x x | x x x | x x x
     *  x x x | x x x | x x x
     *
     *  returns {(3, 6), (3, 6)}
     */
    function getCaseEdgesByCoords(rowId, columnId){

    	var _edges = function(id){
    		var rest = Math.floor(id/3);
    		return {min: rest * 3, max: rest * 3 + 3};
    	};

		return {
			row: _edges(rowId),
			column: _edges(columnId)
		};
    }

    /**
     * Return the max and min values of row/column based on case id.
     *
     * e.g. caseId = 3
     *
     *  X | X | X
     *  -   -   -
     *  O | X | X
     *  -   -   -
     *  X | X | X
     *
     *  returns {(3, 6), (0, 3)}
     */
    function getCaseEdgesById(caseId) {
        var rowMin = Math.floor(caseId/3) * 3;
        var columnMin = (caseId % 3) * 3;
        return {
            row: {
                min: rowMin,
                max: rowMin + 3
            },
            column: {
                min: columnMin,
                max: columnMin + 3
            }
        };
    }

    function removePossibilities(possibilities, indices) {
        for (var i = 0; i < indices.length; i++){
                var j = (i == 0) ? indices[i] : indices[i]-i;
                possibilities.splice(j,1);
            }
    }

    /**
     * Returns the possibilities for a cell.
     */
    function getPossibilities(rows, rowId, columnId){
		var pos = [1,2,3,4,5,6,7,8,9];

        linePossibilities(rows, 'row', rowId, pos);
        linePossibilities(rows, 'column', columnId, pos);

        var caseEdges = getCaseEdgesByCoords(rowId, columnId);
        casePossibilities(rows, caseEdges, pos);

	    return pos;	    	       
    }

    /**
     * Returns possibilities of a cell, based on a vertical/horizontal line.
     */
    function linePossibilities(rows, direction, id, pos){
        pos = (typeof pos === 'undefined') ? [1,2,3,4,5,6,7,8,9] : pos;
    	var indices = [];

        for(var i = 0; i < pos.length; i++){
            for(var j = 0; j < 9; j++){
                var positionValue;

                if (direction === 'row')
                    positionValue = rows[id].columns[j].value;
                if (direction === 'column')
                    positionValue = rows[j].columns[id].value;

                if (pos[i] == positionValue){
                    indices.push(i);
                    j = 9;
                }
            }
        }

		removePossibilities(pos, indices);

		return pos;
    }

    /**
     * Returns the possibilities based on a case.
     */
    function casePossibilities(rows, edges, pos){
        pos = (typeof pos === 'undefined') ? [1,2,3,4,5,6,7,8,9] : pos;
    	var indices = [];
    	for(var p=0; p<9; p++) 	    
		    for(var j = edges.row.min; j < edges.row.max; j++)
	            for(var k = edges.column.min; k < edges.column.max; k++)
	            {
	                if (pos[p] == rows[j].columns[k].value){
						indices.push(p);
						j = 9;
						k=9;
					}
	            }	
		removePossibilities(pos, indices);
		return pos;
    }

    /**
     * Searches for cells with unique possibilities.
     * Return a tuple (state1, state2):
     *     * state1: whether the grid is solvable or not.
     *     * state2: whether it check for more cells with unique possibilities.
     */
    function searchUniquePossibilities(rows){
    	var gridUpdated = false;
        
        var lineSearch = function(direction) {

            var _checkPerpondicularDirection = function(){
                for(var j=0; j<9 && nbrCell<2; j++){
                    var cell = (direction === "row") ? rows[i].columns[j] : rows[j].columns[i];
                    if(cell.value == ""){
                        // we need to check if this value is a possibility for this cell
                        for(var m=0; (m < cell.possibilities.length && cell.possibilities[m] != line_pos[p]); m++);
                            if(cell.possibilities[m] == line_pos[p]){
                                nbrCell++;
                                memCell = j;
                            }
                    }
                }
            };

            for(var i=0; i<9; i++){
                // for each cell of this line get possibilities.
                var line_pos = linePossibilities(rows, direction, i);
                
                for(var p=0; p<line_pos.length; p++){ // for each possibility
                    var nbrCell = 0; // check nbr cells possibly receiving this value
                    var memCell = 0; // memorize the cell that could receive this value
                    
                    _checkPerpondicularDirection();

                    if(nbrCell == 0)
                        return false;

                    if(nbrCell == 1){
                        var cell = (direction === "row") ? rows[i].columns[memCell] : rows[memCell].columns[i];
                        cell.value = line_pos[p];
                        gridUpdated=true;
                    }
                }
            }
            return true;
        };

        if(!lineSearch("row"))
            return [false, null];

        if(!lineSearch("column"))
            return [false, null];

    	//case
		for(var i = 0; i < 9; i++)
		{
            var edges = getCaseEdgesById(i);
			var cellPossibilities = casePossibilities(rows, edges);
			//for each possible value of this case
			for(var k=0; k<cellPossibilities.length; k++)
			{
				var nbrCell = 0;
				var memCell = 0;
				for(var j = 0; (j < 9 && nbrCell < 2); j++)
					if(rows[edges.row.min + Math.floor(j/3)].columns[edges.column.min + (j%3)].value == ""){
						var m;
                        var cell = rows[edges.row.min + Math.floor(j/3)].columns[edges.column.min + (j%3)];
						for(m=0; (m < cell.possibilities.length && cell.possibilities[m] != cellPossibilities[k]); m++);
                            if(cell.possibilities[m] == cellPossibilities[k]){
                                nbrCell++;
                                memCell = j;
                            }
					}

				if(nbrCell == 0)
					return [false, null];

                if(nbrCell  == 1)
				{
					rows[edges.row.min + Math.floor(memCell/3)].columns[edges.column.min + (memCell%3)].value = cellPossibilities[k];
					gridUpdated=true;
				}
			}
		}
	return [true, gridUpdated];
    }

    /**
     * Updates cells possibilities.
     * @return {boolean}
     */
    function UpdatePossibilities(rows) {
        for(var l=0; l<9; l++)
            for(var c=0; c<9; c++)
                if(rows[l].columns[c].value == ""){
                    rows[l].columns[c].possibilities = angular.copy(getPossibilities(rows,l,c));
                    var possibilitiesLength = rows[l].columns[c].possibilities.length;

                    // grid cannot be solved, a cell has no possible values
                    if(possibilitiesLength == 0)
                        return false;

                }
        return true;
    }

    /**
     * Solves the grid.
     *      1. updates cell possibilities.
     *      2. fill cells with unique values.
     *      3. if grid updated, go back to (1.) else go to (4.)
     *      4. backtrack algorithm (does not try the possibilities one by one,
     *                              instead randomly choose possibilities).
     */
	function solveRows(rows){
    	var state = true;
		while(state){
			state = false;

            // try to fill unique values, otherwise return false if not solvable
			if(!UpdatePossibilities(rows))
                return false;

            // check if has more unique values
            var states = searchUniquePossibilities(rows);

            // grid is unsolvable
            if(states[0] == false)
                return false;

            // grid updated loop again
            if(states[1])
                state = true;
		}

		if(isSolved(rows))
			return {state: true, rows: angular.copy(rows)};

		return randomSolving(rows);
    }

    /**
     * Tries to solve the grid randomly.
     * Goes through all cells, and applies all possible values for this cell.
     */
    function randomSolving(rows){
    	for(var l=0; l<9; l++)
    		for(var c=0; c<9; c++)
    			if(rows[l].columns[c].value == ""){ // if cell is empty
                    // get possibilities for this cell
    				rows[l].columns[c].possibilities = angular.copy(getPossibilities(rows, l, c));
    				var nbr_pos = rows[l].columns[c].possibilities.length;
    				while(nbr_pos>0){ // try all possibilities
    					var rows_clone = angular.copy(rows);
    					var randomPossibility = Math.floor((Math.random() * 10) + 1) % nbr_pos;
    					rows_clone[l].columns[c].value = rows_clone[l].columns[c].possibilities[randomPossibility];
    					var results = solveRows(rows_clone); // try t solve for this random possibility

    					if(results['state']){
					   		return {'state':true, 'rows': results['rows']};
					   	}  
					   	else{
                            // if the grid is not solved, remove this from possible values
                            // of this cell and try again
				   			rows_clone[l].columns[c].possibilities.splice(randomPossibility,1);
				   			nbr_pos --;				   			
				   		}    					
    				}
    			}

        // after exhausting all possibilities of all cells, the grid is not solvable.
    	return {'state' :false, 'rows':''};
    }
    
	$scope.getValue = function(value, rowId, columnId) {
        rowId -= 1;
        columnId -= 1;
		if ($scope.rows[rowId].columns[columnId].class == "correct")
			$scope.rows[rowId].columns[columnId].value = $scope.rows_save[rowId].columns[columnId].value;

        if (!(value >= 1 && value <= 9)){
			return "";		
		}		
		return value;		
	};

	$scope.init = function() {		
		$scope.rows = jQuery.extend(true, [], $scope.rows_save);
	};
	
	$scope.clear = function() {		
		$scope.rows = createEmptyRows();
	};

	function genRandList(nbrRandom){
		var randList = [];
		while(randList.length < nbrRandom){
			var rand_i = Math.ceil(Math.random()*9) - 1;
			if (randList.indexOf(rand_i) === -1){
				randList.push(rand_i);
			}
		}		
		return randList;
	}

    /**
     * Generates a new grid.
     */
	$scope.generate = function() {		
		var rows = createEmptyRows();
		var results = solveRows(rows);
		if(results['state']){
			alert("creating new grid");			
			rows = angular.copy(results['rows']);
			for (var l=0; l<9; l++){
				for(var c=0; c<9; c++){				
					rows[l].columns[c].class = "correct";				
				}
			}
			//first we generate a sequence of the lines [1,2, 3, ..., 9]
			var randomCells = genRandList(9);
			//delete 8 values from 3 lines
			for (var l=0; l<3; l++){
				randomIndices = genRandList(8);
				for (var c=0; c<8; c++){
					rows[randomCells[l]].columns[randomIndices[c]].class = "";
					rows[randomCells[l]].columns[randomIndices[c]].value = "";
				}
			}
			//delete 6 values from 2 lines
			for (var l=3; l<5; l++){
				randomIndices = genRandList(6);
				for (var c=0; c<6; c++){
					rows[randomCells[l]].columns[randomIndices[c]].class = "";
					rows[randomCells[l]].columns[randomIndices[c]].value = "";
				}
			}
			//delete 4 values from 2 lines
			for (var l=5; l<7; l++){
				randomIndices = genRandList(4);
				for (var c=0; c<4; c++){
					rows[randomCells[l]].columns[randomIndices[c]].class = "";
					rows[randomCells[l]].columns[randomIndices[c]].value = "";
				}
			}
			//delete 3 values from 2 square
			for (var l=7; l<9; l++){
				var randomIndices = genRandList(3);
				for (var c=0; c<3; c++){
					rows[randomCells[l]].columns[randomIndices[c]].class = "";
					rows[randomCells[l]].columns[randomIndices[c]].value = "";
				}
			}			
		}
		$scope.rows_save = angular.copy(rows);
		$scope.rows = angular.copy(rows);
	};

	$scope.check = function(rowId, columnId) {
		rowId = rowId - 1;
		columnId = columnId - 1;
		var value = $scope.rows[rowId].columns[columnId].value;

		if ($scope.rows[rowId].columns[columnId].class == "correct")
			return;
		
		if (!(!isNaN(parseFloat(value)) && isFinite(value))){
			$scope.rows[rowId].columns[columnId].class = changeClass($scope.rows[rowId].columns[columnId].class, "error");
			$scope.rows[rowId].columns[columnId].value = '';
			return 
		}
			
		$scope.rows[rowId].columns[columnId].class =  changeClass($scope.rows[rowId].columns[columnId].class,"valide");
		for(var j = 0; j < 9; j++)
	    {
	        if((value == $scope.rows[rowId].columns[j].value) && columnId != j){
	            $scope.rows[rowId].columns[columnId].class = changeClass($scope.rows[rowId].columns[columnId].class,"error");
	            $scope.rows[rowId].columns[j].class = changeClass($scope.rows[rowId].columns[j].class, "error");
	           }
	    }
	    for(var j = 0; j < 9; j++)
	    {
	    	if((value == $scope.rows[j].columns[columnId].value) && rowId != j){
	            $scope.rows[rowId].columns[columnId].class = changeClass($scope.rows[rowId].columns[columnId].class, "error");
	            $scope.rows[j].columns[columnId].class = changeClass("error", $scope.rows[j].columns[columnId].class);
	           }
	    }
	    var edges = getCaseEdgesByCoords(rowId, columnId);
	    		
        for(var j = edges.row.min; j < edges.row.max; j++)
            for(var k=edges.column.min; k<edges.column.max; k++)
            {
                if((value == $scope.rows[j].columns[k].value) && j != rowId && k != columnId){
					$scope.rows[rowId].columns[columnId].class = changeClass($scope.rows[rowId].columns[columnId].class,"error");
	            	$scope.rows[j].columns[k].class = changeClass($scope.rows[j].columns[k].class, "error");
	            	}
            }	    	   		
   	};
   	   	   
	$scope.possibilities = function(row_id, column_id) {
		row_id = row_id - 1;
		column_id = column_id - 1;
		var pos = getPossibilities($scope.rows, row_id, column_id);
		$scope.rows[row_id].columns[column_id].possibilities = angular.copy(pos);
		$scope.currentPossibilities = angular.copy(pos);
	};
	
	$scope.solve = function() {
		var results = solveRows($scope.rows);
		if(results['state']){
			$scope.rows = jQuery.extend(true, [], results['rows']);
			alert("solved");			
		}
		else
			alert("can't be solved")
	};
}); 
