'use strict';

describe('Service: BookServiceNegotiationSpec', function () {

    var BookService = {};
    var BookKeeper = {};
    var BookEntry = {};

    var uuid = null;
    var entityUUID = null;
    var amount = null;
    var expected = null;

    beforeEach(function () {
        module('tnt.catalog.service.book');
        module('tnt.catalog.bookkeeping.entry');

        module(function ($provide) {
            $provide.value('BookKeeper', BookKeeper);
        });
    });

    beforeEach(function () {
        uuid = 'cc02b600-5d0b-11e3-96c3-010001000001',
        entityUUID = 'cc02b600-1337-11e3-96c3-010001000001';
    });

    beforeEach(inject(function (_BookService_, _BookEntry_) {
        BookService = _BookService_;
        BookEntry = _BookEntry_;
    }));

    beforeEach(function () {
        spyOn(BookService, 'write');
    });

    describe('When negotiation is triggered with amount > 0', function () {

        beforeEach(function () {
            amount = 150;
            // Given
            expected = [new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001, 
                creditAccount : 43005,
                document : uuid,
                entity : entityUUID,
                op : 'Acrécimos s/ Recebimentos',
                amount : amount
            })];
        });

        it('should write in book with the right entry', function () {
            // When
            var result = BookService.negotiation(uuid, entityUUID, amount);
            // Then
            expect(result).toEqual(expected);
        });
    });
    
    describe('When negotiation is triggered with amount < 0', function () {

        beforeEach(function () {
            amount = -150;
            // Given
            expected = [new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 63103, 
                creditAccount : 70001,
                document : uuid,
                entity : entityUUID,
                op : 'Descontos s/ Recebtos',
                amount : -amount
            })];
        });

        it('should write in book with the right entry', function () {
            // When
            var result = BookService.negotiation(uuid, entityUUID, amount);
            // Then
            expect(result).toEqual(expected);
        });
    });

});
