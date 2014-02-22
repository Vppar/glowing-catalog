'use strict';
describe('Service: BookKeeperNukeSpec', function() {

    // instantiate service
    var BookKeeper = {};
    var JournalKeeper = {};
    var IdentityService = {};
    var creditAccount = {};
    var debitAccount = {};
    var fakeNow = {};
    var newBook = {};
    var newBook2 = {};
    var snaps = {};
    // load the service's module

    beforeEach(function() {
        module('tnt.catalog.bookkeeping.keeper');
        module('tnt.catalog.bookkeeping.entry');
        module('tnt.catalog.bookkeeping.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    beforeEach(function() {
        creditAccount = "creditCashFlow";
        debitAccount = "debitCashFlow";
        fakeNow = 1386179100000;

        newBook = {
            uuid : 'numn1nh0-d3m4-f1g4-f0s7-1nh3m3m1f4g1',
            access : fakeNow,
            name : debitAccount,
            type : 'syntethic',
            nature : 'debit',
            entities : 'Joao Da Silva'
        };

        newBook2 = {
            uuid : 'numn1nh0-d3m4-f4g4-f0s7-1nh4m3m4f4g4',
            access : fakeNow,
            name : creditAccount,
            type : 'synthetic',
            nature : 'credit',
            entities : 'Joao Da Silva'
        };
        
        snaps = [newBook, newBook2, {uuid : null,
            access : fakeNow,
            name : creditAccount,
            type : 'synthetic',
            nature : 'credit',
            entities : 'maria Betonera'}];
    });

    beforeEach(function() {
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        
        IdentityService.getUUIDData = jasmine.createSpy('IdentityService.getUUIDData').andReturn({
            deviceId : 1
        });
        IdentityService.getDeviceId = jasmine.createSpy('IdentityService.getDeviceId').andReturn(1);
        
        module(function($provide) {
            $provide.value('JournalKeeper', JournalKeeper);
            $provide.value('IdentityService', IdentityService);
        });
    });

    beforeEach(inject(function(_BookKeeper_, _ArrayUtils_, _JournalEntry_) {
        BookKeeper = _BookKeeper_;
    }));

    it('should create replace the current books with the snapshot', function() {
        // Given
        BookKeeper.handlers['addBookV1'](newBook);
        // When
        BookKeeper.handlers['snapBooksV1'](snaps);
        
        // Then
        expect(BookKeeper.list().length).toBe(3);
    });
});
