(function (angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.liquidate.ctrl', []).controller(
        'ReceivableConfigureLiquidateCtrl',
        [
            '$scope',
            '$filter',
            '$q',
            'dialog',
            'ArrayUtils',
            'ReceivableService',
            'BookService',
            'DialogService',
            function ($scope, $filter, $q, dialog, ArrayUtils, ReceivableService, BookService,
                DialogService) {

                $scope.paymentOptions = [
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

                $scope.selectedBank = {
                    name : undefined,
                    account : undefined
                };

                // Deposit Accounts
                $scope.accounts =
                    angular.copy($filter('filter')(BookService.list(), filterByAccount));

                $scope.banks = ArrayUtils.distinct($scope.accounts, 'name');

                /**
                 * Filter only deposit accounts accounts that begin with 1115
                 */
                function filterByAccount (book) {
                    if (book.access >= 11151 && book.access <= 11159) {
                        return true;
                    }
                    return false;
                }

                $scope.confirmLiquidate = function () {
                    var receivable = angular.copy(dialog.data);
                    var paymentType = angular.copy($scope.paymentType);

                    if (paymentType === '3') {
                        // Check
                        dialog.close($q.reject(paymentType));
                    } else {
                        var account = (paymentType === '2') ? $scope.selectedBank.account : 11111;

                        // Deposit
                        var result = receiveReceivable(receivable, account);
                        dialog.close(result);
                    }
                };

                $scope.cancel = function () {
                    dialog.close();
                };

                $scope.$watchCollection('selectedBank', function () {
                    $scope.filteredAccount = $filter('filter')($scope.accounts, function (item) {
                        return (item.name === $scope.selectedBank.name);
                    });
                });

                function receiveReceivable (receivable, account) {
                    var result = null;
                    result =
                        ReceivableService.receive(
                            receivable.uuid,
                            new Date().getTime(),
                            receivable.type,
                            receivable.order.uuid,
                            receivable.entityId,
                            receivable.amount,
                            account);

                    return result;

                }

            }
        ]);
}(angular));