Sudoku.controller('SudokuController', function SudokuController($scope, $http) {
	$http.get("data/rows.json").success(function(data) {
		$scope.rows = jQuery.extend(true, [], data);		
		$scope.rows_clear = jQuery.extend(true, [], data);
		$scope.rows_save = jQuery.extend([], data);	
		$scope.current_possibilities = [];	
		for (var l=0; l<9; l++)
			for(var c=0; c<9; c++){
				$scope.rows_clear[l].columns[c].value = "";
				$scope.rows_clear[l].columns[c].class = "";
			}		
	});
	
	function is_solved(rows)
	{
		for(var i=0; i<9; i++)
		for(var k=0; k<9; k++)
		if(rows[i].columns[k].value == "")
			return false;
		return true;
	}	
	
	function change_class (old_class, new_class) {
        if (old_class == "correct")
        	return old_class;
        else
        	return new_class;        
    };
    
    function get_row_column_edges(row_id, column_id){
    	var i = row_id / 3;
	    var row_min = 0;
	    var row_max = 0;
	    if (i < 1){
	    	row_min = 0;
	    	row_max = 3;
	    }		    	
		else{
		 if(i < 2){
		    	row_min = 3;
		    	row_max = 6;
		    }
		 else if(i < 3){
		    	row_min = 6;
		    	row_max = 9;
		    }
		}   
		var i = column_id / 3;
	    var column_min = 0;
	    var column_max = 0;
	    if (i < 1){
	    	column_min = 0;
	    	column_max = 3;
	    }		    	
		else{
		 if(i < 2){
		    	column_min = 3;
		    	column_max = 6;
		    }
		 else if(i < 3){
		    	column_min = 6;
		    	column_max = 9;
		    }
		}
		return [row_min,row_max,column_min,column_max];
    };
    
    function get_possibilities(rows, row_id, column_id){ 		
		var pos = [1,2,3,4,5,6,7,8,9];						
		//check line
		var indices = [];		
		for(var i=0; i<pos.length; i++){				
			for(var j=0; j<9; j++){														
				if (pos[i] == rows[row_id].columns[j].value){
					indices.push(i);						
					j=9;
				}				
			} 
		}						
		for (var i=0; i<indices.length; i++){
			var j = (i==0) ? indices[i] : indices[i]-i;			
			pos.splice(j,1);
		}								
		//check column		
		var indices = [];
		for(var i=0; i<pos.length; i++){
			for(var j=0; j<9; j++){
				if (pos[i] == rows[j].columns[column_id].value){
					indices.push(i);
					j=9;
				}
			} 
		}		
		for (var i=0; i<indices.length; i++){
			var j = (i==0) ? indices[i] : indices[i]-i;		
			pos.splice(j,1);
		}												
		//check case
		var indices = [];
		var edges = get_row_column_edges(row_id, column_id)
	    var row_min = edges[0];
	    var row_max = edges[1];	    
	    var column_min = edges[2];
	    var column_max = edges[3];	    
	    for(var i=0; i<pos.length; i++)
		    for(var j=row_min; j<row_max; j++)
	            for(var k=column_min; k<column_max; k++)
	            {
	                if (pos[i] == rows[j].columns[k].value){
						indices.push(i);
						j=9;
						k=9;
					}
	            }
		for (var i=0; i<indices.length; i++){
			var j = (i==0) ? indices[i] : indices[i]-i;		
			pos.splice(j,1);
		}		     
	    return pos;	    	       
    }
    
    function line_possibilities(rows, l){
    	var pos = [1,2,3,4,5,6,7,8,9];
    	var indices = [];
    	for(var p=0; p<9; p++)
    		for(var c=0; c<9; c++){
    			if (pos[p] == rows[l].columns[c].value){
					indices.push(p);
					c=9;
				}
    		}		
		for (var i=0; i<indices.length; i++){
			var j = (i==0) ? indices[i] : indices[i]-i;		
			pos.splice(j,1);
		}				
		return pos;
    }
    
    function column_possibilities(rows, c){    	
    	var pos = [1,2,3,4,5,6,7,8,9];
    	var indices = [];
    	for(var p=0; p<9; p++)
    		for(var l=0; l<9; l++){    		    			
    			if (pos[p] == rows[l].columns[c].value){
					indices.push(p);
					l=9;
				}
    		}		
		for (var i=0; i<indices.length; i++){
			var j = (i==0) ? indices[i] : indices[i]-i;		
			pos.splice(j,1);
		}		
		return pos;
    }
	    
    function case_possibilities(rows, i){
    	var c_line = Math.floor(i/3);
		var c_column = i%3;		
		c_line*=3;
		c_column*=3;
    	var pos = [1,2,3,4,5,6,7,8,9];
    	var indices = [];
    	for(var p=0; p<9; p++) 	    
		    for(var j=c_line; j<(c_line+3); j++)
	            for(var k=c_column; k<(c_column+3); k++)
	            {
	                if (pos[p] == rows[j].columns[k].value){
						indices.push(p);
						j=9;
						k=9;
					}
	            }	
		for (var i=0; i<indices.length; i++){
			var j = (i==0) ? indices[i] : indices[i]-i;		
			pos.splice(j,1);
		}		
		return pos
    }
    
    function search_unique_cases(rows){
    	stats = false;    	
    	//line    	    	
    	for(var l=0; l<9; l++){
    		var line_pos = line_possibilities(rows, l);    		
    		for(var p=0; p<line_pos.length; p++){
    			var nbr_cells = 0; //nbr cells possibly receiving this value
    			var mem_c = 0; //memorize the column that could receive this value
    			for(var c=0; c<9 && nbr_cells<2; c++){
    				if(rows[l].columns[c].value == ""){
    					var m;//need to check if this value is a possibility for this cell    					
						for(m=0; (m<rows[l].columns[c].possibilities.length && rows[l].columns[c].possibilities[m] != line_pos[p]); m++);
						if(rows[l].columns[c].possibilities[m] == line_pos[p]){
							nbr_cells++;
							mem_c = c;
						}													
    				}
    			}
    			if(nbr_cells == 0)
					return [false, stats];
				if(nbr_cells == 1){
					rows[l].columns[mem_c].value = line_pos[p]; 
					stats=true;
				}
    		}
    	}    	
    	//column
    	for(var c=0; c<9; c++){    	    			    	
    		var column_pos = column_possibilities(rows, c);
    		for(var p=0; p<column_pos.length; p++){
    			var nbr_cells = 0; //nbr cells possibly receiving this value
    			var mem_l = 0; //memorize the line that could receive this value
    			for(var l=0; l<9 && nbr_cells<2; l++){
    				if(rows[l].columns[c].value == ""){
    					var m;//need to check if this value is a possibility for this cell
						for(m=0; (m<rows[l].columns[c].possibilities.length && rows[l].columns[c].possibilities[m] != column_pos[p] ); m++);
						if(rows[l].columns[c].possibilities[m] == column_pos[p]){
							nbr_cells++;
							mem_l = l;
						}												
    				}
    			}
    			if(nbr_cells == 0)
					return [false, stats];
				if(nbr_cells == 1){
					rows[mem_l].columns[c].value = column_pos[p]; 
					stats=true;
				}
    		}
    	}    	
    	//case
		for(var i=0; i<9; i++)
		{
			var case_pos = case_possibilities(rows, i);			
			var c_line = Math.floor(i/3);
			var c_column = i%3;
			c_line*=3;
			c_column*=3;
			//for each possible value of this case
			for(var k=0; k<case_pos.length; k++)
			{
				var cpt = 0;
				var mem = 0;
				for(var j=0; (j<9 && cpt<2); j++)
					if(rows[c_line + Math.floor(j/3)].columns[c_column + (j%3)].value == ""){
						var m;
						for(m=0; (m<rows[c_line + Math.floor(j/3)].columns[c_column + (j%3)].possibilities.length && rows[c_line + Math.floor(j/3)].columns[c_column + (j%3)].possibilities[m] != case_pos[k]); m++);
						if(rows[c_line + Math.floor(j/3)].columns[c_column + (j%3)].possibilities[m] == case_pos[k])
						{	
							cpt++;
							mem = j;
						}
					}				
				if(cpt == 0)
					return [false, stats];
				if(cpt  == 1)
				{
					rows[c_line + Math.floor(mem/3)].columns[c_column + (mem%3)].value = case_pos[k];
					stats=true;										
				}
			}
		}
	return [true, stats];  	
    }
    
	function solve_rows(rows){
    	var stat1 = true;
		var stat2 = true;
		while(stat1){
			stat1 = false;
			while(stat2){
				stat2 = false;
				for(var l=0; l<9; l++)
					for(var c=0; c<9; c++)
						if(rows[l].columns[c].value == ""){																				
							rows[l].columns[c].possibilities = jQuery.extend(true, [], get_possibilities(rows,l,c));													
							possibilities_length = rows[l].columns[c].possibilities.length;							
							if(possibilities_length == 0){								
								return false;	
								}		
							if(possibilities_length == 1){
								stat1 = true;
								stat2 = true;
								rows[l].columns[c].value = rows[l].columns[c].possibilities[0];
							}				
							
						}
			}			
			stat2 = true;
			while(stat2){							
				stat2 = false;
				stats = search_unique_cases(rows);				
				if(stats[1]){									
					stat1 = true;
					stat2 = true;
				} 
				if(stats[0] == false){
					return false ;					
				}								
			}
		}		
		if(is_solved(rows)){			
			return {'stat':true, 'rows':jQuery.extend(true, [], rows)};
		}
		return random_solving(rows);
		return {'stat' :false, 'rows':''};	
    }
    
    function random_solving(rows){
    	for(var l=0; l<9; l++)
    		for(var c=0; c<9; c++)
    			if(rows[l].columns[c].value == ""){
    				rows[l].columns[c].possibilities = jQuery.extend(true, [], get_possibilities(rows,l,c));
    				nbr_pos = rows[l].columns[c].possibilities.length;    				
    				while(nbr_pos>0){
    					r_clone = jQuery.extend(true, [], rows);
    					var r = Math.floor((Math.random()*10)+1)%nbr_pos;    					    				
    					r_clone[l].columns[c].value = r_clone[l].columns[c].possibilities[r]
    					results = solve_rows(r_clone);
    					if(results['stat']){					   		
					   		return {'stat':true, 'rows':jQuery.extend(true, [], results['rows'])};
					   	}  
					   	else{
				   			r_clone[l].columns[c].possibilities.splice(r,1);
				   			nbr_pos --;				   			
				   		}    					
    				}
    			}
    	return {'stat' :false, 'rows':''};		
    }
    
	$scope.get_value = function(value, row_id, column_id) {		
		if ($scope.rows[row_id-1].columns[column_id-1].class == "correct")
			$scope.rows[row_id-1].columns[column_id-1].value = $scope.rows_save[row_id-1].columns[column_id-1].value;		 								
		if (!(value >= 1 && value <= 9)){
			return "";		
		}		
		return value;		
	}
	
	$scope.check_class = function(value) {
		return (value=="correct") ? true : false;  
	}
	
	$scope.init = function() {		
		$scope.rows = jQuery.extend(true, [], $scope.rows_save);
	}
	
	$scope.clear = function() {		
		$scope.rows = jQuery.extend(true, [], $scope.rows_clear);
	}

	function gen_rand_list(nbr_rands){
		rand_list = []
		while(rand_list.length < nbr_rands){
			rand_i = Math.ceil(Math.random()*9) - 1;
			if (rand_list.indexOf(rand_i) === -1){
				rand_list.push(rand_i);
			}
		}		
		return rand_list;
	}
	
	$scope.generate = function() {		
		var rows = jQuery.extend(true, [], $scope.rows_clear);
		var results = solve_rows(rows);
		if(results['stat']){
			alert("creating new grid");			
			rows = jQuery.extend(true, [], results['rows']);
			for (var l=0; l<9; l++){
				for(var c=0; c<9; c++){				
					rows[l].columns[c].class = "correct";				
				}
			}
			//first we generate a sequence of the lines [1,2, 3, ..., 9]
			rand_squares = gen_rand_list(9);				
			//delete 8 values from 3 lines
			for (var l=0; l<3; l++){
				rand_indices = gen_rand_list(8);				
				for (var c=0; c<8; c++){
					rows[rand_squares[l]].columns[rand_indices[c]].class = "";
					rows[rand_squares[l]].columns[rand_indices[c]].value = "";					
				}
			}
			//delete 6 values from 2 lines
			for (var l=3; l<5; l++){
				rand_indices = gen_rand_list(6);
				for (var c=0; c<6; c++){
					rows[rand_squares[l]].columns[rand_indices[c]].class = "";
					rows[rand_squares[l]].columns[rand_indices[c]].value = "";
				}
			}
			//delete 4 values from 2 lines
			for (var l=5; l<7; l++){
				rand_indices = gen_rand_list(4);
				for (var c=0; c<4; c++){
					rows[rand_squares[l]].columns[rand_indices[c]].class = "";
					rows[rand_squares[l]].columns[rand_indices[c]].value = "";
				}
			}
			//delete 3 values from 2 square
			for (var l=7; l<9; l++){
				rand_indices = gen_rand_list(3);
				for (var c=0; c<3; c++){
					rows[rand_squares[l]].columns[rand_indices[c]].class = "";
					rows[rand_squares[l]].columns[rand_indices[c]].value = "";
				}
			}			
		}
		$scope.rows_save = jQuery.extend(true, [], rows);
		$scope.rows = jQuery.extend(true, [], rows);						
	}	

	$scope.check = function(row_id, column_id) {			
		row_id = row_id - 1;
		column_id = column_id - 1;		
		value = $scope.rows[row_id].columns[column_id].value
		if ($scope.rows[row_id].columns[column_id].class == "correct")
			return 
		if (!(!isNaN(parseFloat(value)) && isFinite(value))){
			$scope.rows[row_id].columns[column_id].class = change_class($scope.rows[row_id].columns[column_id].class, "error");
			$scope.rows[row_id].columns[column_id].value = '';
			return 
		}
			
		$scope.rows[row_id].columns[column_id].class =  change_class($scope.rows[row_id].columns[column_id].class,"valide");
		for(var j=0; j<9; j++)
	    {
	        if((value == $scope.rows[row_id].columns[j].value) && column_id != j){
	            $scope.rows[row_id].columns[column_id].class = change_class($scope.rows[row_id].columns[column_id].class,"error");
	            $scope.rows[row_id].columns[j].class = change_class($scope.rows[row_id].columns[j].class, "error");
	           }
	    }
	    for(var j=0; j<9; j++)
	    {
	    	if((value == $scope.rows[j].columns[column_id].value) && row_id != j){	        
	            $scope.rows[row_id].columns[column_id].class = change_class($scope.rows[row_id].columns[column_id].class, "error");
	            $scope.rows[j].columns[column_id].class = change_class("error", $scope.rows[j].columns[column_id].class);
	           }
	    }
	    var edges = get_row_column_edges(row_id, column_id)
	    var row_min = edges[0];
	    var row_max = edges[1];	    
	    var column_min = edges[2];
	    var column_max = edges[3];
	    		
        for(var j=row_min; j<row_max; j++)
            for(var k=column_min; k<column_max; k++)
            {
                if((value == $scope.rows[j].columns[k].value) && j != row_id && k != column_id){
					$scope.rows[row_id].columns[column_id].class = change_class($scope.rows[row_id].columns[column_id].class,"error");
	            	$scope.rows[j].columns[k].class = change_class($scope.rows[j].columns[k].class, "error");
	            	}
            }	    	   		
   	};
   	   	   
	$scope.possibilities = function(row_id, column_id) {
		row_id = row_id - 1;
		column_id = column_id - 1;
		pos = get_possibilities($scope.rows, row_id, column_id);		
		$scope.rows[row_id].columns[column_id].possibilities = jQuery.extend(true, [], pos);			
		$scope.current_possibilities = jQuery.extend(true, [], pos);	
	};
	
	$scope.solve = function() {
		results = solve_rows($scope.rows);
		if(results['stat']){
			$scope.rows = jQuery.extend(true, [], results['rows']);
			alert("solved");			
		}
		else
			alert("can't be solved")
	}
}); 
