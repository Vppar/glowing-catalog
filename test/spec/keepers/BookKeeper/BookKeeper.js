'use strict';

describe('Service: BookKeeper', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.bookkeeping');
        module('tnt.catalog.bookkeeping.entry');
    });

    // instantiate service
    var BookKeeper = {};

    beforeEach(inject(function(_BookKeeper_) {
        BookKeeper = _BookKeeper_;
    }));

    it('should do something', function() {
        expect(!!BookKeeper).toBe(true);
    });

    

});
