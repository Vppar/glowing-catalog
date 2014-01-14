'use strict';
describe('Service: KeyboardService', function() {

	// load the service's module
	beforeEach(module('tnt.catalog.keyboard.service'));

	// instantiate service
	var KeyboardService = undefined;
	beforeEach(inject(function(_KeyboardService_) {
		KeyboardService = _KeyboardService_;
	}));

	it('should do something', function() {
		expect(!!KeyboardService).toBe(true);
	});

	xit('should\'t register an input without id', function() {

		var inputmock = {

		};

		KeyboardService.register(inputmock);
	});

	xit('should register a valid input', function() {
		expect(!!KeyboardService).toBe(true);
	});

	xit('should register the openKeyboard function in the input', function() {
		expect(!!KeyboardService).toBe(true);
	});

	xit('should register an input', function() {

	});
});
