'use strict';

describe('Service: BookServiceLiquidateSpec', function () {

    var BookService = {};
    var BookKeeper = {};
    var BookEntry = {};

    var document = null;
    var entityUUID = null;
    var amount = null;
    var type = null;
    var expected = null;

    beforeEach(function () {
        module('tnt.catalog.service.book');
        module('tnt.catalog.bookkeeping.entry');

        module(function ($provide) {
            $provide.value('BookKeeper', BookKeeper);
        });
    });

    beforeEach(function () {
        document = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            type : 'Pedido'
        };
        entityUUID = 'cc02b600-1337-11e3-96c3-010001000001';
        amount = 150;
        type = null;
    });

    beforeEach(inject(function (_BookService_, _BookEntry_) {
        BookService = _BookService_;
        BookEntry = _BookEntry_;
    }));

    beforeEach(function () {
        spyOn(BookService, 'write');
    });

    describe('When type is CASH', function () {

        beforeEach(function () {
            // Given
            type = 'cash';
            expected = new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11111,
                creditAccount : 70001,
                document : document,
                entity : entityUUID,
                op : 'Recebimento em dinheiro',
                amount : amount
            });
        });

        it('should write in book with the right entry', function () {
            // When
            BookService.liquidate(type, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.write).toHaveBeenCalledWith(expected);
        });
    });

    describe('When type is CHECK', function () {
        beforeEach(function () {
            // Given
            type = 'check';
            expected = new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11131,
                creditAccount : 11121,
                document : document,
                entity : entityUUID,
                op : 'Depósito cheque',
                amount : amount
            });
        });

        it('should write in book with the right entry', function () {
            // When
            BookService.liquidate(type, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.write).toHaveBeenCalledWith(expected);
        });
    });

    describe('When type is CREDIT CARD', function () {
        beforeEach(function () {
            // Given
            type = 'card';
            expected = new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11131,
                creditAccount : 11512,
                document : document,
                entity : entityUUID,
                op : 'Recebimento cartão',
                amount : amount
            });
        });

        it('should write in book with the right entry', function () {
            // When
            BookService.liquidate(type, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.write).toHaveBeenCalledWith(expected);
        });
    });
    describe('When type is ON CUFF', function () {
        beforeEach(function () {
            // Given
            type = 'cuff';
            expected = new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11111,
                creditAccount : 11511,
                document : document,
                entity : entityUUID,
                op : 'Recebimento parcela',
                amount : amount
            });
        });

        it('should write in book with the right entry', function () {
            // When
            BookService.liquidate(type, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.write).toHaveBeenCalledWith(expected);
        });
    });

    describe('When type is VOUCHER', function () {
        beforeEach(function () {
            // Given
            type = 'voucher';
            expected = new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21301,
                creditAccount : 70001,
                document : document,
                entity : entityUUID,
                op : 'Abatimento vale crédito',
                amount : amount
            });
        });
        it('should write in book with the right entry', function () {
            // When
            BookService.liquidate(type, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.write).toHaveBeenCalledWith(expected);
        });
    });

    describe('When type is GIFRT', function () {
        beforeEach(function () {
            // Given
            type = 'gift';
            expected = new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21305,
                creditAccount : 70001,
                document : document,
                entity : entityUUID,
                op : 'Abatimento vale presente',
                amount : amount
            });
        });

        it('should write in book with the right entry', function () {
            // When
            BookService.liquidate(type, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.write).toHaveBeenCalledWith(expected);
        });
    });

});
