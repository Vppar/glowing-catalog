(function(angular) {
    'use strict';

    angular.module('tnt.catalog.productsToBuy.confirm.dialog.ctrl', []).controller(
            'ProductsToBuyConfirmDialogCtrl', function($scope, $q, dialog) {
                
                $scope.payment = {};
                $scope.payment.duedate = dialog.data.duedate;
                $scope.payment.amount = dialog.data.amount;
                $scope.payment.method = '';

                $scope.cancel = function cancel() {
                    dialog.close($q.reject());
                };

                $scope.confirm = function confirm() {
                    console.log($scope.payment.method);
                    dialog.close(true);
                };

            });
}(angular));
