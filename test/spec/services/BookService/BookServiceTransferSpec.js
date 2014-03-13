'use strict';

describe('Service: BookServiceTransferSpec', function() {

    var BookService = {};
    var BookEntry = {};
    var BookKeeper = {};

    var document = null;
    var entityUUID = null;
    var amount = null;
    var newType = null;
    var oldType = null;
    var expected = null;
    
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
        amount = 150;
    });

    beforeEach(inject(function(_BookService_, _BookEntry_) {
        BookService = _BookService_;
        BookEntry = _BookEntry_;
    }));
    
    beforeEach(function(){
        spyOn(BookService, 'write');
        spyOn(BookService, 'transfer').andCallThrough();
    });
    
    describe('When trasnfering from check to cuff', function(){
        beforeEach(function () {
            // Given
            newType = 'cuff';
            oldType = 'check';
            expected = new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11511,
                creditAccount : 11121,
                document : document,
                entity : entityUUID,
                op : 'Transferencia de cheque para a receber',
                amount : amount
            });

        });

        it('should create a properly entry and write in book keeper', function () {
            // When
            BookService.transfer(newType, oldType, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.write).toHaveBeenCalledWith(expected);
        });
        
    });
    
    describe('When trasnfering from card to cuff', function(){
        beforeEach(function () {
            // Given
            newType = 'cuff';
            oldType = 'card';
            expected = new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11511,
                creditAccount : 11512,
                document : document,
                entity : entityUUID,
                op : 'Transferencia de cartao para a receber',
                amount : amount
            });

        });

        it('should create a properly entry and write in book keeper', function () {
            // When
            BookService.transfer(newType, oldType, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.write).toHaveBeenCalledWith(expected);
        });
        
    });
    
    describe('When trasnfering from cuff to card', function(){
        beforeEach(function () {
            // Given
            newType = 'card';
            oldType = 'cuff';
            expected = new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11512,
                creditAccount : 11511,
                document : document,
                entity : entityUUID,
                op : 'Transferencia de a receber para cartao',
                amount : amount
            });

        });

        it('should create a properly entry and write in book keeper', function () {
            // When
            BookService.transfer(newType, oldType, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.write).toHaveBeenCalledWith(expected);
        });
        
    });
    
    describe('When trasnfering from check to card', function(){
        beforeEach(function () {
            // Given
            newType = 'card';
            oldType = 'check';
            expected = new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11512,
                creditAccount : 11121,
                document : document,
                entity : entityUUID,
                op : 'Transferencia de cheque para cartao',
                amount : amount
            });

        });

        it('should create a properly entry and write in book keeper', function () {
            // When
            BookService.transfer(newType, oldType, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.write).toHaveBeenCalledWith(expected);
        });
    });
    
    describe('When trasnfering from cuff to check', function(){
        beforeEach(function () {
            // Given
            newType = 'check';
            oldType = 'cuff';
            expected = new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11121,
                creditAccount : 11511,
                document : document,
                entity : entityUUID,
                op : 'Transferencia de a receber para cheque',
                amount : amount
            });

        });

        it('should create a properly entry and write in book keeper', function () {
            // When
            BookService.transfer(newType, oldType, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.write).toHaveBeenCalledWith(expected);
        });
    });
    
    describe('When trasnfering from card to check', function(){
        beforeEach(function () {
            // Given
            newType = 'check';
            oldType = 'card';
            expected = new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 11121,
                creditAccount : 11512,
                document : document,
                entity : entityUUID,
                op : 'Transferencia de cartao para cheque',
                amount : amount
            });

        });

        it('should create a properly entry and write in book keeper', function () {
            // When
            BookService.transfer(newType, oldType, document.uuid, entityUUID, amount);
            // Then
            expect(BookService.write).toHaveBeenCalledWith(expected);
        });
    });
});

