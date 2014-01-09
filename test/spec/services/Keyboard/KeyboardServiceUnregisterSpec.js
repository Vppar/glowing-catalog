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

});
