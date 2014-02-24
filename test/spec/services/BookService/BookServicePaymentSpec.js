'use strict';

describe('Service: BookServiceProductReturnSpec', function() {

    var BookService = {};
    var BookEntry = {};

    var orderUUID = undefined;
    var entityUUID = undefined;
    var cash = undefined;
    var check = undefined;
    var card = undefined;
    var cuff = undefined;
    var voucher = undefined;
    var gift = undefined;
    var discount = undefined;
    var coupon = undefined;

    beforeEach(function() {
        module('tnt.catalog.service.book');
        module('tnt.catalog.bookkeeping.entry');
    });

    beforeEach(function() {
        orderUUID = 'cc02b600-5d0b-11e3-96c3-010001000001';
        entityUUID = 'cc02b600-1337-11e3-96c3-010001000001';
        cash = 5;
        check = 69;
        card = 70;
        cuff = 80;
        voucher = 90;
        gift = 69;
        discount = 25;
        coupon = 15;
    });

    beforeEach(inject(function(_BookService_, _BookEntry_) {
        BookService = _BookService_;
        BookEntry = _BookEntry_;
    }));

    it('should create the BookEntries with all parameters', function() {
        // Given
        var expected = [
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11111,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 5
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11121,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11512,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 70
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11511,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 80
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21301,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 90
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21305,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41301,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 25
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41303,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 15
            })
        ];
        // When
        var result = BookService.payment(orderUUID, entityUUID, cash, check, card, cuff, voucher, gift, discount, coupon);
        // Then
        expect(result.length).toBe(8);
        expect(result).toEqual(expected);
    });

    it('should create the BookEntries without cash', function() {
        // Given
        var expected = [
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11121,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11512,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 70
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11511,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 80
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21301,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 90
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21305,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41301,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 25
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41303,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 15
            })
        ];
        // When
        var result = BookService.payment(orderUUID, entityUUID, null, check, card, cuff, voucher, gift, discount, coupon);
        // Then
        expect(result.length).toBe(7);
        expect(result).toEqual(expected);
    });

    it('should create the BookEntries without check', function() {
        // Given
        var expected = [
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11111,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 5
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11512,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 70
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11511,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 80
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21301,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 90
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21305,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41301,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 25
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41303,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 15
            })
        ];
        // When
        var result = BookService.payment(orderUUID, entityUUID, cash, null, card, cuff, voucher, gift, discount, coupon);
        // Then
        expect(result.length).toBe(7);
        expect(result).toEqual(expected);
    });
    it('should create the BookEntries without card', function() {
        // Given
        var expected = [
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11111,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 5
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11121,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11511,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 80
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21301,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 90
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21305,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41301,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 25
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41303,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 15
            })
        ];
        // When
        var result = BookService.payment(orderUUID, entityUUID, cash, check, null, cuff, voucher, gift, discount, coupon);
        // Then
        expect(result.length).toBe(7);
        expect(result).toEqual(expected);
    });
    it('should create the BookEntries without cuff', function() {
        // Given
        var expected = [
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11111,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 5
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11121,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11512,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 70
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21301,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 90
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21305,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41301,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 25
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41303,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 15
            })
        ];
        // When
        var result = BookService.payment(orderUUID, entityUUID, cash, check, card, null, voucher, gift, discount, coupon);
        // Then
        expect(result.length).toBe(7);
        expect(result).toEqual(expected);
    });

    it('should create the BookEntries without voucher', function() {
        // Given
        var expected = [
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11111,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 5
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11121,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11512,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 70
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11511,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 80
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21305,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41301,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 25
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41303,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 15
            })
        ];
        // When
        var result = BookService.payment(orderUUID, entityUUID, cash, check, card, cuff, null, gift, discount, coupon);
        // Then
        expect(result.length).toBe(7);
        expect(result).toEqual(expected);
    });
    it('should create the BookEntries without gift', function() {
        // Given
        var expected = [
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11111,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 5
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11121,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11512,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 70
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11511,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 80
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21301,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 90
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41301,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 25
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41303,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 15
            })
        ];
        // When
        var result = BookService.payment(orderUUID, entityUUID, cash, check, card, cuff, voucher, null, discount, coupon);
        // Then
        expect(result.length).toBe(7);
        expect(result).toEqual(expected);
    });

    it('should create the BookEntries without discount', function() {
        // Given
        var expected = [
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11111,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 5
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11121,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11512,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 70
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11511,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 80
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21301,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 90
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 21305,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 41303,
                creditAccount : 70001,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 15
            })
        ];
        // When
        var result = BookService.payment(orderUUID, entityUUID, cash, check, card, cuff, voucher, gift, null, coupon);
        // Then
        expect(result.length).toBe(7);
        expect(result).toEqual(expected);
    });

    it('should create the BookEntries without coupon', function() {
        // Given
        var expected = [new BookEntry({
            uuid: null,
            created: null,
            debitAccount: 11111,
            creditAccount: 70001,
            document: 'cc02b600-5d0b-11e3-96c3-010001000001',
            entity: 'cc02b600-1337-11e3-96c3-010001000001',
            op: null,
            amount: 5
        }), new BookEntry({
            uuid: null,
            created: null,
            debitAccount: 11121,
            creditAccount: 70001,
            document: 'cc02b600-5d0b-11e3-96c3-010001000001',
            entity: 'cc02b600-1337-11e3-96c3-010001000001',
            op: null,
            amount: 69
        }), new BookEntry({
            uuid: null,
            created: null,
            debitAccount: 11512,
            creditAccount: 70001,
            document: 'cc02b600-5d0b-11e3-96c3-010001000001',
            entity: 'cc02b600-1337-11e3-96c3-010001000001',
            op: null,
            amount: 70
        }), new BookEntry({
            uuid: null,
            created: null,
            debitAccount: 11511,
            creditAccount: 70001,
            document: 'cc02b600-5d0b-11e3-96c3-010001000001',
            entity: 'cc02b600-1337-11e3-96c3-010001000001',
            op: null,
            amount: 80
        }), new BookEntry({
            uuid: null,
            created: null,
            debitAccount: 21301,
            creditAccount: 70001,
            document: 'cc02b600-5d0b-11e3-96c3-010001000001',
            entity: 'cc02b600-1337-11e3-96c3-010001000001',
            op: null,
            amount: 90
        }), new BookEntry({
            uuid: null,
            created: null,
            debitAccount: 21305,
            creditAccount: 70001,
            document: 'cc02b600-5d0b-11e3-96c3-010001000001',
            entity: 'cc02b600-1337-11e3-96c3-010001000001',
            op: null,
            amount: 69
        }), new BookEntry({
            uuid: null,
            created: null,
            debitAccount: 41301,
            creditAccount: 70001,
            document: 'cc02b600-5d0b-11e3-96c3-010001000001',
            entity: 'cc02b600-1337-11e3-96c3-010001000001',
            op: null,
            amount: 25
        })];
        // When
        var result = BookService.payment(orderUUID, entityUUID, cash, check, card, cuff, voucher, gift, discount, null);
        // Then
        expect(result.length).toBe(7);
        expect(result).toEqual(expected);
    });

    it('should create the BookEntrie with only one parameter', function() {
        // Given
        var expected = [new BookEntry({
            uuid: null,
            created: null,
            debitAccount: 11111,
            creditAccount: 70001,
            document: 'cc02b600-5d0b-11e3-96c3-010001000001',
            entity: 'cc02b600-1337-11e3-96c3-010001000001',
            op: null,
            amount: 5
        })];
        // When
        var result = BookService.payment(orderUUID, entityUUID, cash, null, null, null, null, null, null, null);
        // Then
        expect(result.length).toBe(1);
        expect(result).toEqual(expected);
    });
});
