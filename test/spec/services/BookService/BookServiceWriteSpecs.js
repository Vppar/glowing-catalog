'use strict';

describe('Service: BookServiceWriteSpec', function() {

    // instantiate service
    var BookService = {};
    var BookKeeper = {};
    var debitAccount = undefined;
    var creditAccount = undefined;
    var document = undefined;
    var entity = undefined;
    var op = undefined;
    var amount = undefined;
    // load the service's module

    beforeEach(function() {
        module('tnt.catalog.service.book');
    });

    beforeEach(function() {
        debitAccount = "debitCashFlow";
        creditAccount = "creditCashFlow";
        document = '123';
        entity = 'Joao Da Silva';
        op = 'credit';
        amount = 100;
    });

    beforeEach(function() {
        BookKeeper.write = jasmine.createSpy('BookKeeper.write');
        module(function($provide) {
            $provide.value('BookKeeper', BookKeeper);
        });
    });

    beforeEach(inject(function(_BookService_) {
        BookService = _BookService_;
    }));

    it('should inject BookService properly', function() {
        expect(!!BookService).toBe(true);
    });

    it('should automatically create a new book', function() {
        // Given
        var expected = {
            debitAccount : debitAccount,
            creditAccount : creditAccount,
            document : document,
            op : op,
            amount : amount
        };
        // When
        BookService.write(debitAccount, creditAccount, document, entity, op, amount);

        // Then
        expect(BookKeeper.write).toHaveBeenCalledWith(expected);
    });

});
