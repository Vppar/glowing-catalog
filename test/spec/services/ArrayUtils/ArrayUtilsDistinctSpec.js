'use strict';

describe('Service: ArrayUtils', function() {

	// load the service's module
	beforeEach(module('tnt.utils.array'));

	// instantiate service
	var ArrayUtils = undefined;
	beforeEach(inject(function(_ArrayUtils_) {
		ArrayUtils = _ArrayUtils_;
	}));

	it('should list with string', function() {
		// given

		var expected = [ 'valor', 'valor2' ];

		var array = [ {
			property : 'valor',
			property1 : 'etc1',
			property2 : 'etc22'
		}, {
			property : 'valor',
			property1 : 'valor1',
			property2 : 'valor2'
		}, {
			property : 'valor',
			property1 : 'valor1',
			property2 : 'valor'
		}, {
			property : 'valor2',
			property1 : 'valor',
			property2 : 'valor2'
		} ];
		var property = 'property';

		// when
		var response = ArrayUtils.distinct(array, property);
		// then
		expect(expected).toEqual(response);

	});

	it('should list with array', function() {
		// given
		var expected = [ 'valor', 'valor2' ];

		var array = [ {
			property : 'valor',
			property1 : 'etc1',
			property2 : 'etc22'
		}, {
			property : 'valor',
			property1 : 'valor1',
			property2 : 'valor2'
		}, {
			property : 'valor',
			property1 : 'valor1',
			property2 : 'valor'
		}, {
			property : 'valor2',
			property1 : 'valor',
			property2 : 'valor2'
		} ];
		var property = [ 'property' ];

		// when
		var response = ArrayUtils.distinct(array, property);
		// then
		expect(expected).toEqual(response);

	});

	it('should not list', function() {
		// given
		var array = [ {
			property : 'valor',
			property1 : 'etc1',
			property2 : 'etc22'
		}, {
			property : 'valor',
			property1 : 'valor1',
			property2 : 'valor2'
		}, {
			property : 'valor',
			property1 : 'valor1',
			property2 : 'valor'
		}, {
			property : 'valor2',
			property1 : 'valor',
			property2 : 'valor2'
		} ];
		var property = 'property3';

		// when
		var response = ArrayUtils.distinct(array, property);

		// then
		expect(response).toBeNull;

	});

	// FIXME - not deduplicating.
	xit('should distinct with arrays', function() {
		// given
		var array = [ {
			property : [ 'a', 'b' ],
			property1 : 'c',
			property2 : 'd'
		}, {
			property : [ 'a', 'b' ],
			property1 : 'c',
			property2 : 'd'
		}, {
			property : [ 'e' ],
			property1 : 'c',
			property2 : 'd'
		}, {
			property : [ 'f' ],
			property1 : 'c',
			property2 : 'd'
		}, {
			property : [ 'a' ],
			property1 : 'c',
			property2 : 'd'
		} ];

		var expected = [ [ 'a', 'b' ], [ 'e' ], [ 'f' ], [ 'a' ] ];

		var property = 'property';

		// when
		var response = ArrayUtils.distinct(array, property);
		// then
		expect(response).toEqual(expected);

	});

	// FIXME - not deduplicating.
	xit('should distinct with objects', function() {
		// given
		var array = [ {
			property : {
				a : 'a',
				b : 'b'
			},
			property1 : 'c'
		}, {
			property : {
				a : 'a',
				b : 'b'
			},
			property1 : 'c'
		}, {
			property : {
				e : 'e'
			},
			property1 : 'c'
		}, {
			property : {
				f : 'f'
			},
			property1 : 'c'
		}, {
			property : {
				a : 'a'
			},
			property1 : 'c'
		} ];

		var expected = [ {
			a : 'a',
			b : 'b'
		}, {
			e : 'e'
		}, {
			f : 'f'
		}, {
			a : 'a'
		} ];

		var property = 'property';

		// when
		var response = ArrayUtils.distinct(array, property);
		// then
		expect(response).toEqual(expected);

	});

});