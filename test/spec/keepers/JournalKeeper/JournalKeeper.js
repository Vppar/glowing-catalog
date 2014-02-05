'use strict';

describe('Service: Journalservice', function() {
    var Replayer = {};
    
    // load the service's module
    beforeEach(function () {
        module('tnt.catalog.journal');
        
        module(function($provide) {
            $provide.value('Replayer', Replayer);
        });
    });

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
