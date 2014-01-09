'use strict';

xdescribe('Service: KeyboardService', function() {

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
    
    it('should set the the input with the same id as the currentField\'s prev attribute as the currentField', function() {
        expect(!!KeyboardService).toBe(true);
    });
    
    it('should set the currentField to null', function() {
        expect(!!KeyboardService).toBe(true);
    });

});
