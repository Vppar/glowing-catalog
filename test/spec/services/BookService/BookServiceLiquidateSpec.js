'use strict';

describe('Service: BookServiceLiquidateSpec', function () {

    var BookService = {};
    var BookKeeper = {};

    var document = null;
    var entityUUID = null;
    var amount = null;
    var type = null;

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
    
    
    beforeEach(inject(function (_BookService_) {
        BookService = _BookService_;
    }));
    
    beforeEach(function(){
        spyOn(BookService, 'write');
    });
    
    describe('When type is cash', function () {
        beforeEach(function () {
            // Given
            type = 'cash';
            spyOn(BookService, 'liquidateCash');
        });

        it('should call liquidateCash', function () {
            // When
            BookService.liquidate(type, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.liquidateCash).toHaveBeenCalled();
            expect(BookService.write).toHaveBeenCalled();
        });
    });

    describe('When type is check', function () {
        beforeEach(function () {
            // Given
            type = 'check';
            spyOn(BookService, 'liquidateCheck');
        });

        it('should call liquidateCheck', function () {
            // When
            BookService.liquidate(type, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.liquidateCheck).toHaveBeenCalled();
            expect(BookService.write).toHaveBeenCalled();
        });
    });

    describe('When type is card', function () {
        beforeEach(function () {
            // Given
            type = 'card';
            spyOn(BookService, 'liquidateCreditCard');
        });

        it('should call liquidateCreditCard', function () {
            // When
            BookService.liquidate(type, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.liquidateCreditCard).toHaveBeenCalled();
            expect(BookService.write).toHaveBeenCalled();
        });
    });

    describe('When type is Voucher', function () {
        beforeEach(function () {
            // Given
            type = 'voucher';
            spyOn(BookService, 'liquidateVoucher');
        });
        it('should call liquidateVoucher', function () {
            // When
            BookService.liquidate(type, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.liquidateVoucher).toHaveBeenCalled();
            expect(BookService.write).toHaveBeenCalled();
        });
    });

    describe('When type is gift', function () {
        beforeEach(function () {
            // Given
            type = 'gift';
            spyOn(BookService, 'liquidateGift');
        });

        it('should call liquidateGift', function () {
            // When
            BookService.liquidate(type, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.liquidateGift).toHaveBeenCalled();
            expect(BookService.write).toHaveBeenCalled();
        });
    });

});
