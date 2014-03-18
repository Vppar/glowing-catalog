(function (angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.ctrl', [
        'tnt.catalog.filters.uuidCode', 'tnt.catalog.service.book'
    ]).controller(
        'ReceivableCtrl',
        [
            '$scope',
            '$filter',
            'ReceivableService',
            'UserService',
            'BookService',
            function ($scope, $filter, ReceivableService, UserService, BookService) {

                UserService.redirectIfIsNotLoggedIn();

                // An object where lists of receivables can be stored without
                // loosing reference in the child scopes. Don't override this
                // object.
                $scope.receivables = {};
                $scope.header = {
                    description : ""
                };

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
                    $scope.header.description = "> Detalhe";

                };

                // starting by 'list' tab
                $scope.selectReceivableMode('listAll');

                $scope.clearSelectedReceivable = function () {
                    $scope.selectedReceivable = null;
                    $scope.negotiate = false;
                    $scope.header = {
                        description : ""
                    };
                };

            }
        ]);
}(angular));