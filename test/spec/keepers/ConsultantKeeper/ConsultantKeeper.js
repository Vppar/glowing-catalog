'use strict';

describe('ConsultantKeeper', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.consultant');
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.journal');
    });

    // instantiate service
    var ConsultantKeeper = undefined;
    beforeEach(inject(function(_ConsultantKeeper_) {
        ConsultantKeeper = _ConsultantKeeper_;
    }));

    it('should do something', function() {
        expect(!!ConsultantKeeper).toBe(true);
    });

});
