(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.expense', [
        'tnt.catalog.service.storage'
    ]).service('ExpenseService', function ExpenseService(StorageService) {

        /**
         * Storage name of this service.
         */
        var name = 'expenses';
        

        /**
         * List all expenses.
         */
        var expenses = function() {
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
        this.expenses = expenses;
        this.entities = entities;
    });
}(angular));