'use strict';
describe('Service: BookKeeperAddSpec', function() {

    // instantiate service
    var BookKeeper = {};
    var Book = null;
    var JournalKeeper = {};
    var JournalEntry = {};
    var IdentityService = {};
    var creditAccount = {};
    var debitAccount = {};
    var fakeNow = {};
    var newBook = {};
    var newBook2 = {};
    var eventData = {};
    var currentId = null;
    var composeReturn = {};
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
            uuid : 'numn1nh0-d3m4-f4g4-f0s7-1nh4m3m4f4g4',
            access : fakeNow,
            name : debitAccount,
            type : 'syntethic',
            nature : 'debit',
            entities : 'Joao Da Silva'
        };

        newBook2 = {
            uuid : 'numn1nh0-d3m4-f1g4-f0s7-1nh3m3m1f4g1',
            access : fakeNow,
            name : creditAccount,
            type : 'synthetic',
            nature : 'credit',
            entities : 'Joao Da Silva'
        };

        composeReturn = {
            name : 'i\'m a stub'
        };

        eventData = {
            id : 1,
            deviceId : 1,
            typeId : 1
        };
        currentId = 2;

    });

    beforeEach(function() {
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        JournalKeeper.compose = jasmine.createSpy('JournalKeeper.compose').andReturn(composeReturn);
        IdentityService.getUUIDData = jasmine.createSpy('IdentityService.getUUIDData').andReturn(eventData);
        IdentityService.getDeviceId = jasmine.createSpy('IdentityService.getDeviceId').andReturn(1);
        IdentityService.getUUID = jasmine.createSpy('IdentityService.getUUID').andReturn('numn1nh0-d3m4-f4g4-f0s7-1nh4m3m4f4g4');
        module(function($provide) {
            $provide.value('JournalKeeper', JournalKeeper);
            $provide.value('IdentityService', IdentityService);
        });
    });

    beforeEach(inject(function(_Book_, _BookKeeper_, _ArrayUtils_, _JournalEntry_) {
        BookKeeper = _BookKeeper_;
        JournalEntry = _JournalEntry_;
        Book = _Book_;
    }));

    it('should create two new book', function() {
        // Given
        // When
        BookKeeper.handlers['addBookV1'](newBook);
        BookKeeper.handlers['addBookV1'](newBook2);

        // Then
        expect(BookKeeper.list().length).toBe(2);
    });

    it('should properly create the entry', function() {
        // make sure the enrty makes it to the journal
        // Given
        
        var book1 = new Book('numn1nh0-d3m4-f4g4-f0s7-1nh4m3m4f4g4',fakeNow, debitAccount,  'syntethic','debit', 'Joao Da Silva');
        var entry = new JournalEntry(null, book1.created, 'addBook', 1, book1);
        // When
        var result = BookKeeper.addBook(book1);

        // Then
        expect(JournalKeeper.compose).toHaveBeenCalledWith(entry);
        expect(result).toEqual(composeReturn);
    });

});
