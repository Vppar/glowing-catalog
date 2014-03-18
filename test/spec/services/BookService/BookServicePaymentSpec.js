'use strict';

describe('Service: BookServicePaymentSpec', function() {

    var BookService = {};
    var BookEntry = {};
    var BookKeeper = {};

    var entityUUID = null;
    var uuid = null;
    var cashAmount = null;
    var checkAmount = null;
    var cardAmount = null;
    var cuffAmount = null;
    var voucherAmount = null;
    var giftAmount = null;
    var discountAmount = null;
    var couponAmount = null;

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

        cashAmount = 15;
        checkAmount = 25;
        cardAmount = 35;
        cuffAmount = 45;
        voucherAmount = 55;
        giftAmount = 65;
        discountAmount = 75;
        couponAmount = 85;
    });

    beforeEach(inject(function(_BookService_, _BookEntry_) {
        BookService = _BookService_;
        BookEntry = _BookEntry_;
    }));

    it('should create positive cash BookEntry', function() {
        // Given
        var expected = new BookEntry({
            uuid : null,
            created : null,
            debitAccount : 11111,
            creditAccount : 70001,
            document : uuid,
            entity : entityUUID,
            op : 'Recebimento em dinheiro',
            amount : cashAmount
        });
        // When
        var result = BookService.payment(uuid, entityUUID, cashAmount, null, null, null, null, null, null, null);
        // Then
        expect(result.length).toBe(1);
        expect(result[0].debitAccount).toEqual(expected.debitAccount);
        expect(result[0].creditAccount).toEqual(expected.creditAccount);
        expect(result[0].document).toEqual(expected.document);
        expect(result[0].entity).toEqual(expected.entity);
        expect(result[0].op).toEqual(expected.op);
        expect(result[0].amount).toEqual(expected.amount);
    });
    
    it('should create negative cash BookEntry', function() {
        // Given
        var expected = new BookEntry({
            uuid : null,
            created : null,
            debitAccount : 70001,
            creditAccount : 11111,
            document : uuid,
            entity : entityUUID,
            op : 'Troco em dinheiro',
            amount : cashAmount
        });

        // When
        var result = BookService.payment(uuid, entityUUID, -cashAmount, null, null, null, null, null, null, null);
        
        // Then
        expect(result.length).toBe(1);
        expect(result[0].debitAccount).toEqual(expected.debitAccount);
        expect(result[0].creditAccount).toEqual(expected.creditAccount);
        expect(result[0].document).toEqual(expected.document);
        expect(result[0].entity).toEqual(expected.entity);
        expect(result[0].op).toEqual(expected.op);
        expect(result[0].amount).toEqual(expected.amount);
    });

    it('should create check BookEntry', function() {
        // Given
        var expected = new BookEntry({
            uuid : null,
            created : null,
            debitAccount : 11121,
            creditAccount : 70001,
            document : uuid,
            entity : entityUUID,
            op : 'Recebimento em cheque',
            amount : checkAmount
        });

        // When
        var result = BookService.payment(uuid, entityUUID, null, checkAmount, null, null, null, null, null, null);

        // Then
        expect(result.length).toBe(1);
        expect(result[0].debitAccount).toEqual(expected.debitAccount);
        expect(result[0].creditAccount).toEqual(expected.creditAccount);
        expect(result[0].document).toEqual(expected.document);
        expect(result[0].entity).toEqual(expected.entity);
        expect(result[0].op).toEqual(expected.op);
        expect(result[0].amount).toEqual(expected.amount);
    });

    it('should create a credit card BookEntry', function() {
        // Given
        var expected = new BookEntry({
            uuid : null,
            created : null,
            debitAccount : 11512,
            creditAccount : 70001,
            document : uuid,
            entity : entityUUID,
            op : 'Recebimento em cartão',
            amount : cardAmount
        });

        // When
        var result = BookService.payment(uuid, entityUUID, null, null, cardAmount, null, null, null, null, null);

        // Then
        expect(result.length).toBe(1);
        expect(result[0].debitAccount).toEqual(expected.debitAccount);
        expect(result[0].creditAccount).toEqual(expected.creditAccount);
        expect(result[0].document).toEqual(expected.document);
        expect(result[0].entity).toEqual(expected.entity);
        expect(result[0].op).toEqual(expected.op);
        expect(result[0].amount).toEqual(expected.amount);
    });

    it('should create a cuff BookEntry', function() {
        // Given
        var expected = new BookEntry({
            uuid : null,
            created : null,
            debitAccount : 11511,
            creditAccount : 70001,
            document : uuid,
            entity : entityUUID,
            op : 'Saldo a receber',
            amount : cuffAmount
        });

        // When
        var result = BookService.payment(uuid, entityUUID, null, null, null, cuffAmount, null, null, null, null);

        // Then
        expect(result.length).toBe(1);
        expect(result[0].debitAccount).toEqual(expected.debitAccount);
        expect(result[0].creditAccount).toEqual(expected.creditAccount);
        expect(result[0].document).toEqual(expected.document);
        expect(result[0].entity).toEqual(expected.entity);
        expect(result[0].op).toEqual(expected.op);
        expect(result[0].amount).toEqual(expected.amount);
    });

    it('should create a cuff BookEntry', function() {
        // Given
        var expected = new BookEntry({
            uuid : null,
            created : null,
            debitAccount : 11511,
            creditAccount : 70001,
            document : uuid,
            entity : entityUUID,
            op : 'Saldo a receber',
            amount : cuffAmount
        });

        // When
        var result = BookService.payment(uuid, entityUUID, null, null, null, cuffAmount, null, null, null, null);

        // Then
        expect(result.length).toBe(1);
        expect(result[0].debitAccount).toEqual(expected.debitAccount);
        expect(result[0].creditAccount).toEqual(expected.creditAccount);
        expect(result[0].document).toEqual(expected.document);
        expect(result[0].entity).toEqual(expected.entity);
        expect(result[0].op).toEqual(expected.op);
        expect(result[0].amount).toEqual(expected.amount);
    });

    it('should create a cuff BookEntry', function() {
        // Given
        var expected = new BookEntry({
            uuid : null,
            created : null,
            debitAccount : 21301,
            creditAccount : 70001,
            document : uuid,
            entity : entityUUID,
            op : 'Abatimento vale crédito',
            amount : voucherAmount
        });

        // When
        var result = BookService.payment(uuid, entityUUID, null, null, null, null, voucherAmount, null, null, null);

        // Then
        expect(result.length).toBe(1);
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
            debitAccount : 21305,
            creditAccount : 70001,
            document : uuid,
            entity : entityUUID,
            op : 'Abatimento vale presente',
            amount : giftAmount
        });

        // When
        var result = BookService.payment(uuid, entityUUID, null, null, null, null, null, giftAmount, null, null);

        // Then
        expect(result.length).toBe(1);
        expect(result[0].debitAccount).toEqual(expected.debitAccount);
        expect(result[0].creditAccount).toEqual(expected.creditAccount);
        expect(result[0].document).toEqual(expected.document);
        expect(result[0].entity).toEqual(expected.entity);
        expect(result[0].op).toEqual(expected.op);
        expect(result[0].amount).toEqual(expected.amount);
    });

    it('should create a discount BookEntry', function() {
        // Given
        var expected = new BookEntry({
            uuid : null,
            created : null,
            debitAccount : 41301,
            creditAccount : 70001,
            document : uuid,
            entity : entityUUID,
            op : 'Desconto concedido',
            amount : discountAmount
        });

        // When
        var result = BookService.payment(uuid, entityUUID, null, null, null, null, null, null, discountAmount, null);

        // Then
        expect(result.length).toBe(1);
        expect(result[0].debitAccount).toEqual(expected.debitAccount);
        expect(result[0].creditAccount).toEqual(expected.creditAccount);
        expect(result[0].document).toEqual(expected.document);
        expect(result[0].entity).toEqual(expected.entity);
        expect(result[0].op).toEqual(expected.op);
        expect(result[0].amount).toEqual(expected.amount);
    });

    it('should create a coupon BookEntry', function() {
        // Given
        var expected = new BookEntry({
            uuid : null,
            created : null,
            debitAccount : 41303,
            creditAccount : 70001,
            document : uuid,
            entity : entityUUID,
            op : 'Desconto cupom promocional',
            amount : couponAmount
        });

        // When
        var result = BookService.payment(uuid, entityUUID, null, null, null, null, null, null, null, couponAmount);

        // Then
        expect(result.length).toBe(1);
        expect(result[0].debitAccount).toEqual(expected.debitAccount);
        expect(result[0].creditAccount).toEqual(expected.creditAccount);
        expect(result[0].document).toEqual(expected.document);
        expect(result[0].entity).toEqual(expected.entity);
        expect(result[0].op).toEqual(expected.op);
        expect(result[0].amount).toEqual(expected.amount);
    });

    it('should create all BookEntries', function() {
        // Given
        var expected = [
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11111,
                creditAccount : 70001,
                document : uuid,
                entity : entityUUID,
                op : 'Recebimento em dinheiro',
                amount : cashAmount
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11121,
                creditAccount : 70001,
                document : uuid,
                entity : entityUUID,
                op : 'Recebimento em cheque',
                amount : checkAmount
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11512,
                creditAccount : 70001,
                document : uuid,
                entity : entityUUID,
                op : 'Recebimento em cartão',
                amount : cardAmount
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11511,
                creditAccount : 70001,
                document : uuid,
                entity : entityUUID,
                op : 'Saldo a receber',
                amount : cuffAmount
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21301,
                creditAccount : 70001,
                document : uuid,
                entity : entityUUID,
                op : 'Abatimento vale crédito',
                amount : voucherAmount
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21305,
                creditAccount : 70001,
                document : uuid,
                entity : entityUUID,
                op : 'Abatimento vale presente',
                amount : giftAmount
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41301,
                creditAccount : 70001,
                document : uuid,
                entity : entityUUID,
                op : 'Desconto concedido',
                amount : discountAmount
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41303,
                creditAccount : 70001,
                document : uuid,
                entity : entityUUID,
                op : 'Desconto cupom promocional',
                amount : couponAmount
            })
        ];

        // When
        var result =
                BookService.payment(
                        uuid, entityUUID, cashAmount, checkAmount, cardAmount, cuffAmount, voucherAmount, giftAmount,
                        discountAmount, couponAmount);
        // Then
        expect(result.length).toBe(8);
        expect(result[0]).toEqual(expected[0]);
        expect(result[1]).toEqual(expected[1]);
        expect(result[2]).toEqual(expected[2]);
        expect(result[3]).toEqual(expected[3]);
        expect(result[4]).toEqual(expected[4]);
        expect(result[5]).toEqual(expected[5]);
        expect(result[6]).toEqual(expected[6]);
        expect(result[7]).toEqual(expected[7]);
    });

    it('shouldn\'t create BookEntries', function() {
        // Given

        // When
        var result = BookService.payment(uuid, entityUUID, null, null, null, null, null, null, null, null);

        // Then
        expect(result.length).toBe(0);
    });
});
