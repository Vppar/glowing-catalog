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
                        id : 0,
                        describe : 'Cheque'
                    }, {
                        id : 1,
                        describe : 'Dinheiro',
                        account : 11111

                    }
                ];

                // Deposit Accounts
                $scope.accounts =
                    angular.copy($filter('filter')(BookService.list(), filterByAccount));
                /**
                 * Filter only deposit accounts accounts that begin with 1115
                 */
                function filterByAccount (book) {
                    if (book.access >= 11151 && book.access <= 11159) {
                        return true;
                    }
                    return false;
                }
                /**
                 * Init Array with payment options
                 */
                function initPaymentTypes () {
                    var id = 2;

                    for ( var ix in $scope.accounts) {
                        var account = $scope.accounts[ix];
                        $scope.paymentOptions.push({
                            describe : account.name + ' - ' + account.access,
                            id : id++,
                            account : account.access
                        });
                    }
                }

                $scope.confirmLiquidate = function () {
                    var receivable = angular.copy(dialog.data);
                    var paymentType = angular.copy($scope.paymentType);

                    if (paymentType == '0') {
                        // Check
                        dialog.close($q.reject(paymentType));
                    } else {
                        var account = $scope.paymentOptions[paymentType].account;

                        // Deposit
                        var result = receiveReceivable(receivable, account);
                        dialog.close(result);
                    }
                };

                $scope.cancel = function () {
                    dialog.close();
                };

                function receiveReceivable (receivable, account) {
                    var result = null;
                    result =
                        ReceivableService.receive(
                            receivable.uuid,
                            new Date().getTime(),
                            receivable.type,
                            receivable.uuid,
                            receivable.entityId,
                            receivable.amount,
                            account);

                    return result;
                }

                $scope.$watch('paymentType', function () {
                    console.log($scope.paymentType);
                });
                $scope.paymentType = 0;
                initPaymentTypes();
            }
        ]);
}(angular));