(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.expense', []).controller('ReceivableCtrl', function($scope, ReceivableService) {

        /**
         * Expenses list
         */
        $scope.receivables = ReceivableService.receivables();
        $scope.entities = ReceivableService.entities();
    });
}(angular));