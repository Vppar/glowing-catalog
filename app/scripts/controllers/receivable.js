(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.ctrl', []).controller('ReceivableCtrl', function($scope, ReceivableService) {

        /**
         * Receivables list.
         */
        $scope.receivables = ReceivableService.list();
        /**
         * Entities list to augment expenses.
         */
        // $scope.entities = ReceivableService.entities();
        /**
         * Controls which fragment will be shown.
         */
        $scope.selectedReceivableMode = 'write';

        $scope.selectReceivableMode = function selectReceivableMode(selectedMode) {
            $scope.selectedReceivableMode = selectedMode;
        };
    });
}(angular));