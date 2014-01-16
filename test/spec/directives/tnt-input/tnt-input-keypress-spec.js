'use strict';

describe('Directive: tntInput', function() {

    // load the directive's module
    beforeEach(function() {
        module('tnt.catalog.keyboard.input');
    });

    var element, scope, KeyboardService;

    beforeEach(inject(function($rootScope, _KeyboardService_) {
        scope = $rootScope.$new();
        KeyboardService = _KeyboardService_;
    }));
    
    it('teste', inject(function($compile) {
        
        element = angular.element('<div tnt-input id="1" ng-model="value"></div>');
        
        scope.value = '1';
        
        element = $compile(element)(scope);
        
        //console.log(element);
        
        /*
        KeyboardService.keypress('0');
        
        expect(element.text()).toBe('10');
        */
    }));

    xit('should add key pressed when initial value is not zero', inject(function($compile) {
        element = angular.element('<div tnt-input ng-model="value"></div>');
        scope.value = '1';
        element = $compile(element)(scope);
        KeyboardService.keypress('0');
        expect(element.text()).toBe('10');
    }));

    xit('should change to key pressed when initial value is zero', inject(function($compile) {
        element = angular.element('<div tnt-input ng-model="value"></div>');
        scope.value = '0';
        element = $compile(element)(scope);
        KeyboardService.keypress('1');
        expect(element.text()).toBe('1');
    }));

    xit('should not add key pressed when initial value is zero', inject(function($compile) {
        element = angular.element('<div tnt-input ng-model="value"></div>');
        scope.value = '0';
        element = $compile(element)(scope);
        KeyboardService.keypress('0');
        expect(element.text()).toBe('0');
    }));

    xit('should add key pressed when initial value is not zero', inject(function($compile) {
        element = angular.element('<div tnt-input ng-model="value"></div>');
        scope.value = '10';
        element = $compile(element)(scope);
        KeyboardService.keypress('0');
        expect(element.text()).toBe('100');
    }));

    xit('should add key pressed when initial value is not zero zero', inject(function($compile) {
        element = angular.element('<div tnt-input ng-model="value"></div>');
        scope.value = '10';
        element = $compile(element)(scope);
        KeyboardService.keypress('00');
        expect(element.text()).toBe('1000');
    }));

    xit('should backspace element text when value is not zero', inject(function($compile) {
        element = angular.element('<div tnt-input ng-model="value"></div>');
        scope.value = '1234';
        element = $compile(element)(scope);
        KeyboardService.keypress('backspace');
        expect(element.text()).toBe('123');
    }));

    xit('should clear element text', inject(function($compile) {
        element = angular.element('<div tnt-input ng-model="value"></div>');
        scope.value = '1234';
        element = $compile(element)(scope);
        KeyboardService.keypress('clear');
        expect(element.text()).toBe('0');
    }));

    xit('element text length should not be over than the max', inject(function($compile) {
        element = angular.element('<div tnt-input ng-model="value" max-digits="11" ></div>');
        scope.value = '12345678901';
        element = $compile(element)(scope);
        KeyboardService.keypress('1');
        expect(element.text()).toBe('12345678901');
    }));

    xit('element text length should not be under than the min', inject(function($compile) {
        element = angular.element('<div tnt-input ng-model="value" min-digits="3" ></div>');
        scope.value = '123';
        element = $compile(element)(scope);
        KeyboardService.keypress('backspace');
        expect(element.text()).toBe('123');
    }));

});
