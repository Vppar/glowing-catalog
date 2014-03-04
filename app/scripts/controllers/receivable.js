(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.ctrl', [
        'tnt.catalog.filters.uuidCode'
    ]).controller('ReceivableCtrl', function($scope, $filter, ReceivableService, UserService) {

        UserService.redirectIfIsNotLoggedIn();

        // An object where lists of receivables can be stored without
        // loosing reference in the child scopes. Don't override this
        // object.
        $scope.receivables = {};

        // Stores the total of all listed payments
        $scope.receivables.total = 0;

        // Store the actual select receivable
        $scope.selectedReceivable = null;

        $scope.dtFilter = {
            dtInitial : new Date(),
            dtFinal : new Date()
        };

        /**
         * Controls which fragment will be shown.
         */
        // starting by 'list' tab
        $scope.selectedReceivableMode = 'list';

        $scope.selectReceivableMode = function selectReceivableMode(selectedMode) {
            $scope.selectedReceivableMode = selectedMode;
        };

        $scope.$watch('receivables.list', function() {
            $scope.receivables.total = getReceivablesTotal();
        });

        function getReceivablesTotal() {
            return $filter('sum')($scope.receivables.list, 'amount');
        }

        $scope.selectReceivable = function(receivable) {
            // when a receivable is select force redirect to payment tab.
            $scope.selectedReceivable = angular.copy(receivable);
            $scope.selectReceivableMode('receive');
        };

        $scope.clearSelectedReceivable = function() {
            $scope.selectedReceivable = null;
            $scope.selectReceivableMode('list');
        };

    });
}(angular));
