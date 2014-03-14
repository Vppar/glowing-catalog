'use strict';

describe('Service: BookServiceLiquidateSpec', function () {

    var BookService = {};
    var BookKeeper = {};
    var BookEntry = {};

    var uuid = null;
    var entityUUID = null;
    var amount = null;
    var type = null;
    var expected = null;
    var logger = angular.noop;

    var $log = {
        debug : logger,
        error : logger,
        warn : logger,
        fatal : logger
    };
    
    beforeEach(function () {
        spyOn($log, 'debug').andCallThrough();
        spyOn($log, 'error').andCallThrough();
        spyOn($log, 'warn').andCallThrough();
        spyOn($log, 'fatal').andCallThrough();
    });
    
    beforeEach(function () {
        module('tnt.catalog.service.book');
        module('tnt.catalog.bookkeeping.entry');

        module(function ($provide) {
            $provide.value('BookKeeper', BookKeeper);
            $provide.value('$log', $log);
        });
    });

    beforeEach(function () {
        uuid = 'cc02b600-5d0b-11e3-96c3-010001000001',
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

    describe('When type is CHECK', function () {
        beforeEach(function () {
            // Given
            type = 'check';
            expected = [new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 11121,
                document : uuid,
                entity : entityUUID,
                op : 'Recebimento em cheque',
                amount : amount
            })];
        });

        it('should write in book with the right entry', function () {
            // When
            var result = BookService.liquidate(type, uuid, entityUUID, amount);
            // Then
            expect(result).toEqual(expected);
        });
    });

    describe('When type is CREDIT CARD', function () {
        beforeEach(function () {
            // Given
            type = 'card';
            expected = [new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 11512,
                document : uuid,
                entity : entityUUID,
                op : 'Recebimento em cartão',
                amount : amount
            })];
        });

        it('should write in book with the right entry', function () {
            // When
            var result = BookService.liquidate(type, uuid, entityUUID, amount);
            // Then
            expect(result).toEqual(expected);
        });
    });
    
    describe('When type is ON CUFF', function () {
        beforeEach(function () {
            // Given
            type = 'cuff';
            expected = [new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 70001,
                creditAccount : 11511,
                document : uuid,
                entity : entityUUID,
                op : 'Saldo a receber',
                amount : amount
            })];
        });

        it('should write in book with the right entry', function () {
            // When
            var result = BookService.liquidate(type, uuid, entityUUID, amount);
            // Then
            expect(result).toEqual(expected);
        });
    });
    
    describe('When type is invalid', function () {
        beforeEach(function () {
            // Given
            type = 'invalid type riar riar riar';
            
            
            
        });

        it('should write in book with the right entry', function () {
            var logInfo = {
                type : type,
                orderUUID : uuid,
                entityUUID : entityUUID,
                amount : amount
            };
            var expectedLogInfo = 'Failed to identify the receivable liquidation type: BookService.liquidate with: '; 
            // When
            BookService.liquidate(type, uuid, entityUUID, amount);
            // Then
            expect($log.fatal).toHaveBeenCalledWith(expectedLogInfo, logInfo);
        });
    });

});
