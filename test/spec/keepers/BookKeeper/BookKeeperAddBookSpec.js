'use strict';
describe('Service: BookKeeperAddSpec', function() {

    // instantiate service
    var BookKeeper = {};
    var JournalKeeper = {};
    var JournalEntry = {};
    var creditAccount = {};
    var debitAccount = {};
    var fakeNow = {};
    var newBook = {};
    var newBook2 = {};
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
            uuid : null,
            access : fakeNow,
            name : debitAccount,
            type : 'syntethic',
            nature : 'debit',
            entities : 'Joao Da Silva'
        };

        newBook2 = {
            uuid : null,
            access : fakeNow,
            name : creditAccount,
            type : 'synthetic',
            nature : 'credit',
            entities : 'Joao Da Silva'
        };
    });

    beforeEach(function() {
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        module(function($provide) {
            $provide.value('JournalKeeper', JournalKeeper);
        });
    });

    beforeEach(inject(function(_BookKeeper_, _ArrayUtils_, _JournalEntry_) {
        BookKeeper = _BookKeeper_;
        JournalEntry = _JournalEntry_;
    }));

    it('should create two new book', function() {
        // Given

        // When
        BookKeeper.handlers['addBookV1'](newBook);
        BookKeeper.handlers['addBookV1'](newBook2);

        // Then
        expect(BookKeeper.list().length).toBe(2);
    });
});
