'use strict';

describe('Service: StockKeeper', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.stock');
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.journal');
    });

    // instantiate service
    var StockKeeper = undefined;
    beforeEach(inject(function(_StockKeeper_) {
        StockKeeper = _StockKeeper_;
    }));

    it('should do something', function() {
        expect(!!StockKeeper).toBe(true);
    });

});
