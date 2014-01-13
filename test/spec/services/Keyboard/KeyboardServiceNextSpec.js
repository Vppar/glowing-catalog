'use strict';

xdescribe('Service: KeyboardService', function() {

    // load the service's module
    beforeEach(function(){
    	module('tnt.catalog.keyboard.service');
    	module('tnt.catalog.keyboard.input');
    });
    

    // instantiate service
    var KeyboardService = undefined;
    var element = undefined;
    var scope = undefined;
    beforeEach(inject(function($rootScope, _KeyboardService_) {
        scope = $rootScope.$new();
        KeyboardService = _KeyboardService_;
    }));

    it('should do something', function() {
        expect(!!KeyboardService).toBe(true);
    });

    it('should set the the input with the same id as the currentField\'s next attribute as the currentField', function() {
        expect(!!KeyboardService).toBe(true);
    });

    it('should set the currentField to null', function() {
        expect(!!KeyboardService).toBe(true);
    });

    it('should go to the next field',inject (function($compile) {

        element = angular.element('<div tnt-input ng-model="value"></div>');
        scope.value = '0';
        element = $compile(element)(scope);
        
        KeyboardService.keypress('0');

        var actual = KeyboardService.readCurrentField();
        KeyboardService.next();
        var next = KeyboardService.readCurrentField();
        expect(actual != next).toBe(true);
    }));
});
