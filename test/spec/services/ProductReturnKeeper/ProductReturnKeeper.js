'use strict';

describe('Service: ProductReturnKeeper', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.productReturn');
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.journal');
    });

    // instantiate service
    var ProductReturnKeeper = undefined;
    beforeEach(inject(function(_ProductReturnKeeper_) {
        ProductReturnKeeper = _ProductReturnKeeper_;
    }));

    it('should do something', function() {
        expect(!!ProductReturnKeeper).toBe(true);
    });

});
