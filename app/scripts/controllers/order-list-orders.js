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
                //var orders = $scope.orders;
                // $scope.filteredOrders come from OrderListCtrl
                //$scope.filteredOrders = angular.copy(orders);
                var orders = angular.copy($scope.filteredOrders);

                for ( var ix in orders) {
                    var order = orders[ix];
                    // Find the entity name
                    var entity = ArrayUtils.find(entities, 'uuid', order.customerId);
                    if (entity) {
                        order.entityName = entity.name;
                    } else {
                        order.entityName = '';
                    }
                    
                    var qtyTotal = $filter('sum')(order.items, 'qty');
                    var priceTotal = $filter('sum')(order.items, 'price', 'qty');
                    var amountTotal = $filter('sum')(order.items, 'amount');

                    order.itemsQty = qtyTotal;
                    order.avgPrice = (priceTotal + amountTotal) / (qtyTotal);
                    order.amountTotal = (priceTotal + amountTotal);
                }

                $scope.updateAndEnableHideOption = function(order) {
                    $scope.updateReceivablesTotal(order);
                    if ($scope.hideOptions === true) {
                        $scope.invertHideOption();
                    }
                };

                function updateOrdersTotal() {
                    $scope.resetOrdersTotal();
                    var entityMap = {};
                    var filteredOrders = $scope.filteredOrders;
                    for ( var ix in filteredOrders) {
                        var filteredOrder = filteredOrders[ix];

                        if (!entityMap[filteredOrder.customerId]) {
                            entityMap[filteredOrder.customerId] = filteredOrder.customerId;
                            $scope.total.all.entityCount++;
                        }

                        $scope.total.all.amount += filteredOrder.amountTotal;
                        $scope.total.all.qty += filteredOrder.itemsQty;
                        $scope.total.all.orderCount++;
                    }

                    var avgPrice = Math.round(100 * ($scope.total.all.amount / $scope.total.all.qty)) / 100;
                    if (!isNaN(avgPrice)) {
                        $scope.total.all.avgPrice = avgPrice;
                    } else {
                        $scope.total.all.avgPrice = 0;
                    }

                }

              /*  $scope.updateOrdersTotal = updateOrdersTotal;
                $scope.updatePaymentsTotal = updatePaymentsTotal;*/
                /**
                 * Watcher to filter the orders and populate the grid.
                 *//*
                $scope.$watchCollection('dateFilter', function() {
                    $scope.filteredOrders = angular.copy($filter('filter')(orders, $scope.filterByDate));
                    updateOrdersTotal();
                    $scope.updatePaymentsTotal($scope.filteredOrders);
                    $scope.generateVA($scope.filteredOrders);
                });*/

            }]);
}(angular));
