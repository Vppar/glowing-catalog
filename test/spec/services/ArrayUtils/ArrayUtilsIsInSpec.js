'use strict';

describe('Service: ArrayUtils', function() {

	// load the service's module
	beforeEach(module('tnt.utils.array'));

	// instantiate service
	var ArrayUtils = undefined;
	beforeEach(inject(function(_ArrayUtils_) {
		ArrayUtils = _ArrayUtils_;
	}));

	it('should find', function() {
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

	it('should find', function() {
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

		var ids = [ array, expected ];

		var response = ArrayUtils.isIn(array, property, ids);
		expect(response).toEqual(expected);
	});

});
