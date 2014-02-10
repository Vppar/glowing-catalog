(function(angular) {
    'use strict';

    angular.module('tnt.catalog.productsToBuy.confirm.dialog.ctrl', []).controller(
            'ProductsToBuyConfirmDialogCtrl', function($scope, $q, dialog) {

                $scope.cancel = function cancel() {
                    dialog.close($q.reject());
                };

                $scope.back = function back() {
                    dialog.close(true);
                };

            });
}(angular));
