'use strict';
//FIXME it's necessary fix the numpad service or change to keyboard service to it works properly
xdescribe('Directive: tntInput', function() {

	// load the directive's module
	beforeEach(function() {
		module('tnt.catalog.numpad.input');
		module('tnt.catalog.numpad.service');
	});

	var element, scope, KeyboardService;

	beforeEach(inject(function($rootScope, _KeyboardService_) {
		scope = $rootScope.$new();
		KeyboardService = _KeyboardService_;
	}));

	it('should add key pressed value', inject(function($compile) {
		element = angular.element('<div tnt-input ng-model="value"></div>');
		scope.value = '0';
		element = $compile(element)(scope);
		KeyboardService.keypress('0');
		expect(element.text()).toBe('00');
	}));

	it('should backspace element text', inject(function($compile) {
		element = angular.element('<div tnt-input ng-model="value"></div>');
		scope.value = '1234';
		element = $compile(element)(scope);
		KeyboardService.keypress('backspace');
		expect(element.text()).toBe('123');
	}));

	it('should clear element text', inject(function($compile) {
		element = angular.element('<div tnt-input ng-model="value"></div>');
		scope.value = '1234';
		element = $compile(element)(scope);
		KeyboardService.keypress('clear');
		expect(element.text()).toBe('');
	}));

});
