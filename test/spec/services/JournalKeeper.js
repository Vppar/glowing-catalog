'use strict';

describe('Service: Journalservice', function() {

    // load the service's module
    beforeEach(module('tnt.catalog.journal'));

    // instantiate service
    var JournalKeeper = undefined;
    var JournalEntry = undefined;
    
    beforeEach(inject(function(_JournalKeeper_, _JournalEntry_) {
        JournalKeeper = _JournalKeeper_;
        JournalEntry = _JournalEntry_;
    }));

    it('should do something', function() {
        
        expect(!!JournalKeeper).toBe(true);
    });

});
