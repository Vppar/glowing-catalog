(function (angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.ctrl', [
        'tnt.catalog.filters.uuidCode'
    ]).controller(
        'ReceivableCtrl',
        [
            '$scope',
            '$filter',
            'ReceivableService',
            'UserService',
            function ($scope, $filter, ReceivableService, UserService) {

                UserService.redirectIfIsNotLoggedIn();

                // An object where lists of receivables can be stored without
                // loosing reference in the child scopes. Don't override this
                // object.
                $scope.receivables = {};
                $scope.receivablesType = [
                    {
                        id : 1,
                        type : 'Dinheiro'
                    }, {
                        id : 2,
                        type : 'Depósito'
                    }, {
                        id : 3,
                        type : 'Cheque'
                    }
                ];

                // Store the actual select receivable
                $scope.selectedReceivable = null;

                $scope.dtFilter = {
                    dtInitial : new Date(),
                    dtFinal : new Date()
                };

                /**
                 * Controls which fragment will be shown.
                 */

                $scope.selectReceivableMode = function selectReceivableMode (selectedMode) {
                    $scope.selectedReceivableMode = selectedMode;
                };

                $scope.selectReceivable = function (receivable) {
                    // when a receivable is select force redirect to payment
                    // tab.
                    $scope.selectedReceivable = angular.copy(receivable);

                };

                // starting by 'list' tab
                $scope.selectReceivableMode('listAll');

                $scope.clearSelectedReceivable = function () {
                    $scope.selectedReceivable = null;
                    $scope.negotiate = false;
                };

            }
        ]);
}(angular));