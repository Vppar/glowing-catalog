(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.expense', []).controller('ReceivableCtrl', function($scope, ReceivableService) {

        /**
         * Receivables list.
         */
        $scope.receivables = ReceivableService.receivables();

        /**
         * Entities list to augment expenses.
         */
        $scope.entities = ReceivableService.entities();

        /**
         * Controls which fragment will be shown.
         */
        $scope.selectedReceivableMode = 'read';
        
        
        $scope.selectReceivableMode = function selectReceivableMode(selectedMode){
            $scope.selectedReceivableMode = selectedMode;
        };
    });
}(angular));