'use strict';

describe('Service: EntityKeeper', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.entity');
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.journal');
    });

    // instantiate service
    var EntityKeeper = undefined;
    beforeEach(inject(function(_EntityKeeper_) {
        EntityKeeper = _EntityKeeper_;
    }));

    it('should do something', function() {
        expect(!!EntityKeeper).toBe(true);
    });

});
