'use strict';

describe('Service: Gridkeeper', function() {

    // load the service's module
    beforeEach(module('tnt.catalog.grid'));

    // instantiate service
    var GridKeeper = undefined;
    beforeEach(inject(function(_GridKeeper_) {
        GridKeeper = _GridKeeper_;
    }));

    it('should do something', function() {
        expect(!!GridKeeper).toBe(true);
    });

});
