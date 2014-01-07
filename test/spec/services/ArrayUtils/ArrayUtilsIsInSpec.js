'use strict';

describe('Service: ArrayUtils', function() {

	// load the service's module
	beforeEach(module('tnt.utils.array'));

	// instantiate service
	var ArrayUtils = undefined;
	beforeEach(inject(function(_ArrayUtils_) {
		ArrayUtils = _ArrayUtils_;
	}));
	
	it('should find the array of strings', function() {
        // given
        var array = [ {
            property : 'yolo',
            property1 : 'etc',
            property2 : 'teste'
        }, {
            property : 'a',
            property1 : 'b',
            property2 : 'c'
        } ];

        var property = 'property';

        var expected = [ {
            property : 'yolo',
            property1 : 'etc',
            property2 : 'teste'
        } ];

        var ids = [ 'yolo'];

        var response = ArrayUtils.isIn(array, property, ids);
        expect(response).toEqual(expected);
    });

	it('should find the array of strings with 2 values', function() {
		// given
		var array = [ {
			property : 'yolo',
			property1 : 'etc',
			property2 : 'teste'
		}, {
			property : 'a',
			property1 : 'b',
			property2 : 'c'
		} ];

		var property = 'property';

		var ids = [ 'yolo', 'a'];

		var response = ArrayUtils.isIn(array, property, ids);
		expect(response).toEqual(array);
	});

    it('should find with numbers', function() {
        // given
        var array = [ {
            property : 1,
            property1 : 2,
            property2 : 3
        }, {
            property : 9,
            property1 : 8,
            property2 : 7
        } ];
        var property = 'property';
        var ids = [ 1, 9 ];

        var response = ArrayUtils.isIn(array, property, ids);
        expect(response).toEqual(array);
    });
    
    //FIXME
    xit('should find the array inside the arrays', function() {
        // given
        var array = [ {
            property : ['yolo'],
            property1 : ['etc'],
            property2 : ['teste']
        }, {
            property : ['a','b'],
            property1 : ['b'],
            property2 : ['c']
        } ];

        var property = 'property';

        var ids = [ ['yolo'], ['a','b']];

        var response = ArrayUtils.isIn(array, property, ids);
        
        console.log(response);
        
        expect(response.lenght>0).toBe(true);
    });
    
    it('should find with objects', function() {
        // given
        var array = [ {
            property : {a:'a'},
            property1 : {b:'b'},
            property2 : {c:'c'}
        }, {
            property : {e:'e'},
            property1 : {f:'f'},
            property2 : {g:'g'}
        } ];
        var property = 'property';
        var ids = {a:'a'};
        
        var expected = {
                property : {a:'a'},
                property1 : {b:'b'},
                property2 : {c:'c'}
            };
        
        console.log(response);
        
        var response = ArrayUtils.isIn(array, property, ids);
        expect(response).toEqual(array);
    });

});
