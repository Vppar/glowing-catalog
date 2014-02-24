'use strict';

describe('Service: BookServiceProductReturnSpec', function() {

    var BookService = {};
    var BookEntry = {};
    
    var orderUUID = undefined;
    var entityUUID = undefined;
    var productAmount = undefined;
    var productCost = undefined;
    
    beforeEach(function() {
        module('tnt.catalog.service.book');
        module('tnt.catalog.bookkeeping.entry');
    });

    beforeEach(function() {
        orderUUID = 'cc02b600-5d0b-11e3-96c3-010001000001';
        entityUUID = 'cc02b600-1337-11e3-96c3-010001000001';
        productAmount = 5;
        productCost = 69;
    });

    beforeEach(inject(function(_BookService_, _BookEntry_) {
        BookService = _BookService_;
        BookEntry = _BookEntry_;
    }));

    it('should create the BookEntries with all parameters', function() {
        // Given
        var expected = [new BookEntry({
            uuid: null,
            created: null,
            debitAccount: 41305,
            creditAccount: 70001,
            document: 'cc02b600-5d0b-11e3-96c3-010001000001',
            entity: 'cc02b600-1337-11e3-96c3-010001000001',
            op: null,
            amount: 5
        }), new BookEntry({
            uuid: null,
            created: null,
            debitAccount: 11701,
            creditAccount: 51115,
            document: 'cc02b600-5d0b-11e3-96c3-010001000001',
            entity: 'cc02b600-1337-11e3-96c3-010001000001',
            op: null,
            amount: 69
        })];
        // When
        var result = BookService.productReturn(orderUUID, entityUUID, productAmount, productCost);
        // Then
        expect(result.length).toBe(2);
        expect(result).toEqual(expected);
    });

});
