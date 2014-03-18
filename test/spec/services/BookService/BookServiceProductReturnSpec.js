'use strict';

describe('Service: BookServiceProductReturnSpec', function() {

    var BookService = {};
    var BookEntry = {};
    var BookKeeper = {};

    var uuid = null;
    var entityUUID = null;
    var productAmount = null;
    var productCost = null;

    beforeEach(function() {
        module('tnt.catalog.service.book');
        module('tnt.catalog.bookkeeping.entry');

        module(function($provide) {
            $provide.value('BookKeeper', BookKeeper);
        });
    });

    beforeEach(function() {
        uuid = 'cc02b600-5d0b-11e3-96c3-010001000001',
        entityUUID = 'cc02b600-1337-11e3-96c3-010001000001';
        productAmount = 5;
        productCost = 69;
    });

    beforeEach(inject(function(_BookService_, _BookEntry_) {
        BookService = _BookService_;
        BookEntry = _BookEntry_;
    }));

    it('should create a product BookEntry', function() {
        // Given
        var expected = [
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41305,
                creditAccount : 70001,
                document : uuid,
                entity : entityUUID,
                op : 'Devolução de produto',
                amount : productAmount
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11701,
                creditAccount : 51115,
                document : uuid,
                entity : entityUUID,
                op : 'Devolução de produto',
                amount : productCost
            })
        ];

        // When
        var result = BookService.productReturn(uuid, entityUUID, productAmount, productCost);

        // Then
        expect(result.length).toBe(2);

        expect(result[0].debitAccount).toEqual(expected[0].debitAccount);
        expect(result[0].creditAccount).toEqual(expected[0].creditAccount);
        expect(result[0].document).toEqual(expected[0].document);
        expect(result[0].entity).toEqual(expected[0].entity);
        expect(result[0].op).toEqual(expected[0].op);
        expect(result[0].amount).toEqual(expected[0].amount);

        expect(result[1].debitAccount).toEqual(expected[1].debitAccount);
        expect(result[1].creditAccount).toEqual(expected[1].creditAccount);
        expect(result[1].document).toEqual(expected[1].document);
        expect(result[1].entity).toEqual(expected[1].entity);
        expect(result[1].op).toEqual(expected[1].op);
        expect(result[1].amount).toEqual(expected[1].amount);
    });
});
