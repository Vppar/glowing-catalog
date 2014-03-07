(function (angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.orders.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller('OrderListOrdersCtrl', [
        '$scope', function ($scope) {

            $scope.updateAndEnableHideOption = function (order) {
                $scope.checkedOrderUUID = order.uuid;
                $scope.updateReceivablesTotal([
                    order
                ]);

                if ($scope.hideOptions === true) {
                    $scope.invertHideOption();
                }
            };

            $scope.callUpdateReceivableTotal = function (orders) {
                $scope.checkedOrderUUID = null;
                $scope.updateReceivablesTotal(orders);
            };
        }
    ]);
}(angular));
