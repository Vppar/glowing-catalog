(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.receivable', [
        'tnt.catalog.service.storage'
    ]).service('ReceivableService', function ReceivableService(StorageService) {

        /**
         * Storage name of this service.
         */
        var name = 'receivables';
        

        /**
         * List all receivables.
         */
        var receivables = function() {
            return StorageService.list(name);
        };
        /**
         * List all entities.
         */
        var entities = function() {
            return StorageService.list('customers');
        };

        /**
         * Publishing the methods and variables
         */
        this.receivables = receivables;
        this.entities = entities;
    });
}(angular));