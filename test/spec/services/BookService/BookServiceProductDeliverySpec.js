'use strict';

describe('Service: BookServiceProductDeliverySpec', function () {

    var BookService = {};
    var BookKeeper = {};
    var BookEntry = {};

    var orderUUID = null;
    var entityUUID = null;
    var productAmount = null;
    var productCost = null;
    var expected = null;

    beforeEach(function () {
        module('tnt.catalog.service.book');
        module('tnt.catalog.bookkeeping.entry');

        module(function ($provide) {
            $provide.value('BookKeeper', BookKeeper);
        });
    });

    beforeEach(function () {
        orderUUID = 'cc02b600-5d0b-11e3-96c3-010001000001',
        entityUUID = 'cc02b600-1337-11e3-96c3-010001000001';
    });

    beforeEach(inject(function (_BookService_, _BookEntry_) {
        BookService = _BookService_;
        BookEntry = _BookEntry_;
    }));

    describe('When productDelivery is triggered', function () {

        beforeEach(function () {
            productAmount = 15;
            productCost = 20;
            // Given

            expected = [new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21307, 
                creditAccount : 41305,
                document : orderUUID,
                entity : entityUUID,
                op : 'Entrega de produto',
                amount : productAmount
            }),
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 51115, 
                creditAccount : 11701,
                document : orderUUID,
                entity : entityUUID,
                op : 'Entrega de produto',
                amount : productCost
            })];
        });

        it('should create 2 entries with rigth fields', function () {
            // When
            var result = BookService.productDelivery(orderUUID, entityUUID, productAmount, productCost);
            // Then
            expect(result.length).toEqual(2);
            expect(result[0]).toEqual(expected[0]);
            expect(result[1]).toEqual(expected[1]);
        });
    });
    
});
