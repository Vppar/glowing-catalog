'use strict';

describe('Service: AppointmentKeeper', function() {

    // load the service's module
    beforeEach(function() {
    	module('tnt.catalog.appointments');
    	module('tnt.catalog.appointments.keeper');
        module('tnt.catalog.appointments.entity');
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.journal');
    });

    // instantiate service
    var AppointmentKeeper = undefined;
    beforeEach(inject(function(_AppointmentKeeper_) {
    	AppointmentKeeper = _AppointmentKeeper_;
    }));

    it('should do something', function() {
        expect(!!AppointmentKeeper).toBe(true);
    });

});
