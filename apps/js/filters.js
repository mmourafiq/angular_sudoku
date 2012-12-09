Sudoku.filter('column_modulo_3', function() {
    return function(input) {
    	return input%3==1 ? 'margin_left_60' : '';
    };
    });
    
Sudoku.filter('row_modulo_3', function() {
    return function(input) {
    	return (input%3==0 && input<9) ? 'margin_bottom_60' : '';
    };
    });
    
Sudoku.filter('check_number', function() {
    return function(input) {
    	if (input >= 1 && input <= 9)    		
    		return input;
    };
    });
    