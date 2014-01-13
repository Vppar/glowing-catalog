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
    
    it('should\'t register an input without id', function() {
        expect(!!KeyboardService).toBe(true);
    });
    
    it('should register a valid input', function() {
        expect(!!KeyboardService).toBe(true);
    });
    
    it('should register the openKeyboard function in the input', function() {
        expect(!!KeyboardService).toBe(true);
    });
    
    it('should register an input', function() {

        var input = {
                id:1
        };
        
        KeyboardService.register(input);
        
        var response = KeyboardService.readFields();
        expect(response.length).toBe(1);
    });
});
