'use strict';

describe('Service: Numpadservice', function() {

    // load the service's module
    beforeEach(module('tnt.catalog.numpad.service'));

    // instantiate service
    var NumpadService = undefined;
    beforeEach(inject(function(_NumpadService_) {
        NumpadService = _NumpadService_;
    }));

    it('should do something', function() {
        expect(!!NumpadService).toBe(true);
    });

});
