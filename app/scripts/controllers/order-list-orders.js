(function (angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.orders.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller('OrderListOrdersCtrl', [
        '$scope', function ($scope) {
            function init() {
              $scope.filterOrders($scope.orders);
            }
            init();

            $scope.$on('orderAdd', init);
            $scope.$on('orderCancel', init);
            $scope.$on('orderUpdate', init);
            $scope.$on('orderUpdateItemQty', init);
            $scope.$on('nukeOrders', init);

            $scope.$on('nukeEntities', init);
            $scope.$on('entityCreate', init);
            $scope.$on('entityUpdate', init);

            $scope.$on('addBook', init);
            $scope.$on('bookWrite', init);
            $scope.$on('snapBooks', init);
            $scope.$on('nukeBooks', init);
            $scope.$on('nukeEntries', init);

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
