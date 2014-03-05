(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.orders.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller(
            'OrderListOrdersCtrl',
            ['$scope', '$location', '$filter', 'ArrayUtils', 'ReceivableService', 'ProductReturnService', 'VoucherService', 
            function($scope, $location, $filter, ArrayUtils, ReceivableService, ProductReturnService, VoucherService) {

                // $scope.entities come from OrderListCtrl
                var entities = $scope.entities;

                $scope.updateAndEnableHideOption = function(order) {
                    $scope.updateReceivablesTotal(order);
                    if ($scope.hideOptions === true) {
                        $scope.invertHideOption();
                    }
                };

            }]);
}(angular));
