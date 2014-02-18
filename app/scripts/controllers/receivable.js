(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.ctrl', ['tnt.catalog.filters.uuidCode']).controller('ReceivableCtrl', function($scope, $filter, ReceivableService, UserService) {

        UserService.redirectIfIsNotLoggedIn();

        // An object where lists of receivables can be stored without
        // loosing reference in the child scopes. Don't override this
        // object.
        $scope.receivables = {};

        // Stores the list of payments to be displayed
        $scope.receivables.list = ReceivableService.list();

        // Stores the total of all listed payments
        $scope.receivables.total = 0;
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

        $scope.$watch('receivables.list', function () {
            $scope.receivables.total = getReceivablesTotal();
        });

        function getReceivablesTotal() {
            return $filter('sum')($scope.receivables.list, 'amount');
        }
    });
}(angular));
