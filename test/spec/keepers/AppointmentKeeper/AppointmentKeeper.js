'use strict';

describe('Service: EventKeeper', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.vpsa.appointments.entity');
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.journal');
    });

    // instantiate service
    var EventKeeper = undefined;
    beforeEach(inject(function(_EventKeeper_) {
    	EventKeeper = _EventKeeper_;
    }));

    it('should do something', function() {
        expect(!!EventKeeper).toBe(true);
    });

});
