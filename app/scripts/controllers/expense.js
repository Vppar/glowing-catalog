(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.expense', ['tnt.catalog.service.data']).controller('ExpenseCtrl', function($scope, ExpenseService, DataProvider) {
        
        /**
         * Expenses list
         */
        $scope.expenses = ExpenseService.expenses();
        $scope.c = ExpenseService.entities();
    });
}(angular));