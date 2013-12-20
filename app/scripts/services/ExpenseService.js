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
        var list = function() {
            return StorageService.list(name);
        };
        
        var isValid = function isValid(object){
            
        };
        
        
        var add = function add(expense){
            var result = false;
            if(isValid(expense)){
                
            }else{
                
            }
            
            return result;
        };
        

        /**
         * Publishing the methods and variables
         */
        this.list = list;
        this.add = add;
        this.isValid = isValid;

    });
}(angular));