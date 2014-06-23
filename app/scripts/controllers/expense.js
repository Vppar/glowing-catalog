(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.expense', []).controller('ExpenseCtrl', ['$scope', 'ExpenseService', 'UserService', function($scope, ExpenseService, UserService) {

        UserService.redirectIfInvalidUser();
        
        /**
         * Expenses list.
         */
        $scope.expenses = ExpenseService.expenses();

        /**
         * Entities list to augment expenses.
         */
        $scope.entities = ExpenseService.entities();

        /**
         * Controls which fragment will be shown.
         */
        $scope.selectedExpenseMode = 'read';
        
        
        $scope.selectExpenseMode = function selectExpenseMode(selectedMode){
            $scope.selectedExpenseMode = selectedMode;
        };
        
    }]);
}(angular));