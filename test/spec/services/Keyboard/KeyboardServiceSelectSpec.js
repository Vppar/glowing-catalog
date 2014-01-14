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
    
    it('should set the input as the currentField', function() {
        expect(!!KeyboardService).toBe(true);
    });
    
    it('should set the selected field of the currentField as true', function() {
        expect(!!KeyboardService).toBe(true);
    });

});
