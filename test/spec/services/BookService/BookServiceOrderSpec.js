'use strict';

describe('Service: BookServiceOrderSpec', function() {

    var BookService = {};
    var BookEntry = {};
    var BookKeeper = {};

    var document = null;
    var entityUUID = null;
    var productAmount = null;
    var voucherAmount = null;
    var giftAmount = null;

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
        productAmount = 5;
        voucherAmount = 69;
        giftAmount = 138;
    });

    beforeEach(inject(function(_BookService_, _BookEntry_) {
        BookService = _BookService_;
        BookEntry = _BookEntry_;
    }));

    it('should create a product BookEntry', function() {
        // Given
        var expected = new BookEntry({
            uuid : null,
            created : null,
            debitAccount : 70001,
            creditAccount : 21307,
            document : document,
            entity : entityUUID,
            op : 'Valor bruto da venda',
            amount : productAmount
        });

        // When
        var result = BookService.order(document.uuid, entityUUID, productAmount, null, null);

        // Then
        expect(result.length).toBe(1);
        expect(result[0].debitAccount).toEqual(expected.debitAccount);
        expect(result[0].creditAccount).toEqual(expected.creditAccount);
        expect(result[0].document).toEqual(expected.document);
        expect(result[0].entity).toEqual(expected.entity);
        expect(result[0].op).toEqual(expected.op);
        expect(result[0].amount).toEqual(expected.amount);
    });

    it('should create a voucher BookEntry', function() {
        // Given
        var expected = new BookEntry({
            uuid : null,
            created : null,
            debitAccount : 70001,
            creditAccount : 21301,
            document : document,
            entity : entityUUID,
            op : 'Valor total vale crédito',
            amount : voucherAmount
        });

        // When
        var result = BookService.order(document.uuid, entityUUID, null, voucherAmount, null);

        // Then
        expect(result[0].length).toBe(expected.length);
        expect(result[0].debitAccount).toEqual(expected.debitAccount);
        expect(result[0].creditAccount).toEqual(expected.creditAccount);
        expect(result[0].document).toEqual(expected.document);
        expect(result[0].entity).toEqual(expected.entity);
        expect(result[0].op).toEqual(expected.op);
        expect(result[0].amount).toEqual(expected.amount);
    });

    it('should create a gift card BookEntry', function() {
        // Given
        var expected = new BookEntry({
            uuid : null,
            created : null,
            debitAccount : 70001,
            creditAccount : 21305,
            document : document,
            entity : entityUUID,
            op : 'Valor total vale presente',
            amount : giftAmount
        });

        // When
        var result = BookService.order(document.uuid, entityUUID, null, null, giftAmount);

        // Then
        expect(result.length).toBe(1);
        expect(result[0].debitAccount).toEqual(expected.debitAccount);
        expect(result[0].creditAccount).toEqual(expected.creditAccount);
        expect(result[0].document).toEqual(expected.document);
        expect(result[0].entity).toEqual(expected.entity);
        expect(result[0].op).toEqual(expected.op);
        expect(result[0].amount).toEqual(expected.amount);
    });

    it('should create all order BookEntries', function() {
        // Given
        var expected = [
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 21307,
                document : document,
                entity : entityUUID,
                op : 'Valor bruto da venda',
                amount : productAmount
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 21301,
                document : document,
                entity : entityUUID,
                op : 'Valor total vale crédito',
                amount : voucherAmount
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 21305,
                document : document,
                entity : entityUUID,
                op : 'Valor total vale presente',
                amount : giftAmount
            })
        ];

        // When
        var result = BookService.order(document.uuid, entityUUID, productAmount, voucherAmount, giftAmount);

        // Then
        expect(result.length).toBe(3);
        expect(result[0]).toEqual(expected[0]);
        expect(result[1]).toEqual(expected[1]);
        expect(result[2]).toEqual(expected[2]);
        expect(result[3]).toEqual(expected[3]);
        expect(result[4]).toEqual(expected[4]);
        expect(result[5]).toEqual(expected[5]);
        expect(result[6]).toEqual(expected[6]);
        expect(result[7]).toEqual(expected[7]);
    });

    it('shouldn\'t create book entries', function() {
        // Given
        // When
        var result = BookService.order(document.uuid, entityUUID, null, null, null);
        // Then
        expect(result.length).toBe(0);
    });
});
