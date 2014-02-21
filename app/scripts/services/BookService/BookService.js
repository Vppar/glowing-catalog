(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.book', []).service('BookService', function BookService(BookKeeper, Book) {

        this.write = function(debitAcc, creditAcc, document, entity, op, amount) {
            var entry = {
                debitAccount : debitAcc,
                creditAccount : creditAcc,
                document : document,
                op : op,
                amount : amount
            };
            BookKeeper.write(entry);
        };

        this.addBook = function(name, type, nature, entities) {
            BookKeeper.addBook(new Book(null, null, name, type, nature, entities));
        };
        
        this.snapShot = function(books){
            BookKeeper.snapShot(books);
        };
        
        this.list = function() {
            return angular.copy(BookKeeper.list);
        };
    });
}(angular));