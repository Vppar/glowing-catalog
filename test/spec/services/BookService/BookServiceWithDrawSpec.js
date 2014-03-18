'use strict';

describe('Service: BookServiceDepositSpec', function () {

    var BookService = {};
    var BookEntry = {};
    var BookKeeper = {};

    var orderUUID = null;
    var entityUUID = null;
    var amount = null;
    var account = null;

    beforeEach(function () {
        module('tnt.catalog.service.book');
        module('tnt.catalog.bookkeeping.entry');

        module(function ($provide) {
            $provide.value('BookKeeper', BookKeeper);
        });
    });

    beforeEach(function () {
        orderUUID = 'cc02b600-5d0b-11e3-96c3-010001000001';
        entityUUID = 'cc02b600-1337-11e3-96c3-010001000001';
        amount = 5;
        account = 99999;
    });

    beforeEach(inject(function (_BookService_, _BookEntry_) {
        BookService = _BookService_;
        BookEntry = _BookEntry_;
    }));

    describe('When deposit is triggered', function () {
        it('should create a deposit BookEntry', function () {

            // Given
            var expected = [
                new BookEntry({
                    uuid : null,
                    created : null,
                    debitAccount : 70001,
                    creditAccount : account,
                    document : orderUUID,
                    entity : entityUUID,
                    op : 'Pagamento',
                    amount : amount
                })
            ];
            // When
            var result = BookService.withdraw(account, amount, orderUUID, entityUUID);

            // Then
            expect(result.length).toBe(1);
            expect(result).toEqual(expected);

        });

    });
});
