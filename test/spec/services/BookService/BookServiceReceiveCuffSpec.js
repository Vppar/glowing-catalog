'use strict';

describe('Service: BookServiceLiquidateCuffSpec', function() {

    var BookService = {};
    var BookEntry = {};
    var BookKeeper = {};

    var document = null;
    var entityUUID = null;
    var cuffAmount = null;

    beforeEach(function() {
        module('tnt.catalog.service.book');
        module('tnt.catalog.bookkeeping.entry');

        module(function($provide) {
            $provide.value('BookKeeper', BookKeeper);
        });
    });

    beforeEach(function() {
        document = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            type : 'Pedido'
        };
        entityUUID = 'cc02b600-1337-11e3-96c3-010001000001';
        cuffAmount = 150;
    });

    beforeEach(inject(function(_BookService_, _BookEntry_) {
        BookService = _BookService_;
        BookEntry = _BookEntry_;
    }));

    it('should create a receive check BookEntry', function() {
        // Given
        var expected = new BookEntry({
            uuid : null,
            created : null,
            debitAccount : 11111,
            creditAccount : 11511,
            document : document,
            entity : entityUUID,
            op : 'Recebimento parcela',
            amount : cuffAmount
        });

        // When
        var result = BookService.liquidateCuff(document.uuid, entityUUID, cuffAmount);

        // Then
        expect(result.debitAccount).toEqual(expected.debitAccount);
        expect(result.creditAccount).toEqual(expected.creditAccount);
        expect(result.document).toEqual(expected.document);
        expect(result.entity).toEqual(expected.entity);
        expect(result.op).toEqual(expected.op);
        expect(result.amount).toEqual(expected.amount);

    });

    it('shouldn\'t create a receive check BookEntry', function() {
        // Given

        // When
        var result = BookService.liquidateCuff(document.uuid, entityUUID, 0);

        // Then
        expect(result).toBe(null);
    });
});
