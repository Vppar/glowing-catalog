'use strict';

describe('Service: BookKeeperWriteSpecr', function() {

    // instantiate service
    var BookKeeper = {};
    var ArrayUtils = {};
    var JournalKeeper = {};
    var JournalEntry = {};
    var creditAccount = {};
    var debitAccount = {};
    var fakeNow = {};
    var fakeUUID = {};
    var bookEntry = {};
    var bookEntry2 = {};
    var composeReturn = {};
    var IdentityService ={};
    // load the service's module

    beforeEach(function() {
        module('tnt.catalog.bookkeeping');
        module('tnt.catalog.bookkeeping.entry');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    beforeEach(function() {
        creditAccount = "creditCashFlow";
        debitAccount = "debitCashFlow";
        fakeNow = 1386179100000;
        composeReturn = {
            name : 'i\'m a stub'
        };
        
        bookEntry = {
            uuid : null,
            created : fakeNow,
            debitAccount : debitAccount,
            creditAccount : creditAccount,
            document : '123',
            entity : 'Joao Da Silva',
            op : 'credit',
            amount : 100
        };

        bookEntry2 = {
            uuid : null,
            created : fakeNow,
            debitAccount : debitAccount,
            creditAccount : creditAccount,
            document : '123',
            entity : 'Maria Antonieta',
            op : 'credit',
            amount : 20
        };
    });

    beforeEach(function() {
        fakeUUID= '123456-4646231231-6465';
        JournalKeeper.compose = jasmine.createSpy('JournalKeeper.compose').andReturn(composeReturn);
        IdentityService.getUUID = jasmine.createSpy('IdentityService.getUUID').andReturn(fakeUUID);
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        module(function($provide) {
            $provide.value('JournalKeeper', JournalKeeper);
            $provide.value('IdentityService', IdentityService);
        });
    });

    beforeEach(inject(function(_BookKeeper_, _ArrayUtils_, _JournalEntry_) {
        BookKeeper = _BookKeeper_;
        ArrayUtils = _ArrayUtils_;
        JournalEntry = _JournalEntry_;
    }));

    it('should inject BookKeeper properly', function() {
        expect(!!BookKeeper).toBe(true);
    });

    it('should automatically create a new book', function() {
        // Given

        // When
        BookKeeper.handlers['bookWriteV1'](bookEntry);

        // Then
        expect(BookKeeper.read().length).toBe(2);
    });

    it('should debit a newly created book', function() {
        // given

        // when
        BookKeeper.handlers['bookWriteV1'](bookEntry);

        // then
        var book = ArrayUtils.list(BookKeeper.read(), 'name', bookEntry.entity);
        var book2 = ArrayUtils.find(book, 'reference', debitAccount);
        expect((book2.balance)).toEqual(-100);
    });

    it('should credit a newly created book', function() {
        // given

        // when
        BookKeeper.handlers['bookWriteV1'](bookEntry);

        var book = ArrayUtils.list(BookKeeper.read(), 'name', bookEntry.entity);
        var book2 = ArrayUtils.find(book, 'reference', creditAccount);
        // then
        expect((book2.balance)).toEqual(100);
    });

    it('should debit a previously existing book', function() {
        // given

        // when
        BookKeeper.handlers['bookWriteV1'](bookEntry);// 100
        BookKeeper.handlers['bookWriteV1'](bookEntry2);// 20

        var book = ArrayUtils.list(BookKeeper.read(), 'reference', debitAccount);
        var totalDebitAccount = 0;
        for(var i in book){
            totalDebitAccount += book[i].balance;
        }
        // then
        expect((totalDebitAccount)).toEqual(-120);
    });

    it('should credit a previously existing book', function() {
        // given

        // when
        BookKeeper.handlers['bookWriteV1'](bookEntry);// 100
        BookKeeper.handlers['bookWriteV1'](bookEntry2);// 20

        var book = ArrayUtils.list(BookKeeper.read(), 'reference', creditAccount);
        
        var totalcreditAccount = 0;
        for(var i in book){
            totalcreditAccount += book[i].balance;
        }
        // then
        expect((totalcreditAccount)).toEqual(120);
    });

    it('should properly create the entry', function() {
        // make sure the enrty makes it to the journal
        // Given
        var entry = new JournalEntry(null, bookEntry.created, 'bookWrite', 1, bookEntry);

        //When
        var result = BookKeeper.write(bookEntry);

        //Then
        expect(JournalKeeper.compose).toHaveBeenCalledWith(entry);
        expect(result).toEqual(composeReturn);
    });

});
