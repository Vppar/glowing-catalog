'use strict';

describe('Service: BookServiceOrderSpec', function() {

    var BookService = {};
    var BookEntry = {};

    var orderUUID = undefined;
    var entityUUID = undefined;
    var productAmount = undefined;
    var productCost = undefined;
    var voucher = undefined;
    var gift = undefined;

    beforeEach(function() {
        module('tnt.catalog.service.book');
        module('tnt.catalog.bookkeeping.entry');
    });

    beforeEach(function() {
        orderUUID = 'cc02b600-5d0b-11e3-96c3-010001000001';
        entityUUID = 'cc02b600-1337-11e3-96c3-010001000001';
        productAmount = 5;
        productCost = 69;
        voucher = 69;
        gift = 138;
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
                debitAccount : 70001,
                creditAccount : 41101,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 5
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 51115,
                creditAccount : 11701,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 21301,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 21305,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 138
            })
        ];
        // When
        var result = BookService.order(orderUUID, entityUUID, productAmount, productCost, voucher, gift);
        // Then
        expect(result.length).toBe(4);
        expect(result).toEqual(expected);
    });

    it('should create the BookEntries without productAmount', function() {
        // Given
        var expected = [
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 21301,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 21305,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 138
            })
        ];
        // When
        var result = BookService.order(orderUUID, entityUUID, null, productCost, voucher, gift);
        // Then
        expect(result.length).toBe(2);
        expect(result).toEqual(expected);
    });

    it('should create the BookEntries without productCost', function() {
        // Given
        var expected = [
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 41101,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 5
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 51115,
                creditAccount : 11701,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : null
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 21301,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 21305,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 138
            })
        ];
        // When
        var result = BookService.order(orderUUID, entityUUID, productAmount, null, voucher, gift);
        // Then
        expect(result.length).toBe(4);
        expect(result).toEqual(expected);
    });

    it('should create the BookEntries without voucher', function() {
        // Given
        var expected = [
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 41101,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 5
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 51115,
                creditAccount : 11701,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 69
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 21305,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 138
            })
        ];
        // When
        var result = BookService.order(orderUUID, entityUUID, productAmount, productCost, null, gift);
        // Then
        expect(result.length).toBe(3);
        expect(result).toEqual(expected);
    });

    it('should create the BookEntries without voucher', function() {
        // Given
        var expected = [new BookEntry({
            uuid: null,
            created: null,
            debitAccount: 70001,
            creditAccount: 41101,
            document: 'cc02b600-5d0b-11e3-96c3-010001000001',
            entity: 'cc02b600-1337-11e3-96c3-010001000001',
            op: null,
            amount: 5
        }), new BookEntry({
            uuid: null,
            created: null,
            debitAccount: 51115,
            creditAccount: 11701,
            document: 'cc02b600-5d0b-11e3-96c3-010001000001',
            entity: 'cc02b600-1337-11e3-96c3-010001000001',
            op: null,
            amount: 69
        }), new BookEntry({
            uuid: null,
            created: null,
            debitAccount: 70001,
            creditAccount: 21301,
            document: 'cc02b600-5d0b-11e3-96c3-010001000001',
            entity: 'cc02b600-1337-11e3-96c3-010001000001',
            op: null,
            amount: 69
        })];
        // When
        var result = BookService.order(orderUUID, entityUUID, productAmount, productCost, voucher, null);
        // Then
        expect(result.length).toBe(3);
        expect(result).toEqual(expected);
    });

    it('should create the BookEntries with only one parameter', function() {
        // Given
        var expected = [
            new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 41101,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : 5
            }), new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 51115,
                creditAccount : 11701,
                document : 'cc02b600-5d0b-11e3-96c3-010001000001',
                entity : 'cc02b600-1337-11e3-96c3-010001000001',
                op : null,
                amount : null
            })
        ];
        // When
        var result = BookService.order(orderUUID, entityUUID, productAmount, null, null, null);
        // Then
        expect(result.length).toBe(2);
        expect(result).toEqual(expected);
    });
});
