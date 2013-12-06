(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.receivable', [
        'tnt.catalog.service.data'
    ]).service('ReceivableService', function ReceivableService(DataProvider) {

        // Easy access to receivables
        var receivables = DataProvider.receivables;

        /**
         * Returns a new id to be used in a receivable.
         */
        var getNextId = function getNextId() {
            var nextId = 1;
            if (receivables) {
                nextId = receivables.length + 1;
            }
            return nextId;
        };

        this.getNextId = getNextId;
    });
}(angular));