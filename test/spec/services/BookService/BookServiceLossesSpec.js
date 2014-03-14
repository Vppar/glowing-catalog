'use strict';

describe('Service: BookServiceEarningSpec', function () {

    var BookService = {};
    var BookKeeper = {};
    var BookEntry = {};

    var document = null;
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
        document = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            type : 'Pedido'
        };
        entityUUID = 'cc02b600-1337-11e3-96c3-010001000001';
        amount = 150;
    });

    beforeEach(inject(function (_BookService_, _BookEntry_) {
        BookService = _BookService_;
        BookEntry = _BookEntry_;
    }));

    beforeEach(function () {
        spyOn(BookService, 'write');
    });

    describe('When earning is triggered', function () {

        beforeEach(function () {
            // Given
            expected = new BookEntry({
                uuid : null,
                created : null,
                debitAccount : 63103,
                creditAccount : 70001,
                document : document,
                entity : entityUUID,
                op : 'Adiantamentos de Clientes',
                amount : amount
            });
        });

        it('should write in book with the right entry', function () {
            // When
            BookService.losses(document.uuid, entityUUID, amount);
            // Then
            expect(BookService.write).toHaveBeenCalledWith(expected);
        });
    });

});
