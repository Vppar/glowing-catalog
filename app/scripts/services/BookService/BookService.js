(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.book', []).service('BookService', function BookService(BookKeeper) {

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

        this.list = function() {
            return angular.copy(BookKeeper.list);
        };
    });
}(angular));