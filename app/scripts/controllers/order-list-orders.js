(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.orders.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller(
            'OrderListOrdersCtrl',
            function($scope, $location, $filter, ArrayUtils, ReceivableService, ProductReturnService, VoucherService) {

                // $scope.entities come from OrderListCtrl
                var entities = $scope.entities;
                var orders = $scope.orders;
                // $scope.filteredOrders come from OrderListCtrl
                $scope.filteredOrders = angular.copy(orders);

                for ( var ix in orders) {
                    var order = orders[ix];
                    // Find the entity name
                    order.entityName = ArrayUtils.find(entities, 'uuid', order.customerId).name;

                    var qtyTotal = $filter('sum')(order.items, 'qty');
                    var priceTotal = $filter('sum')(order.items, 'price', 'qty');
                    var amountTotal = $filter('sum')(order.items, 'amount');

                    order.itemsQty = qtyTotal;
                    order.avgPrice = (priceTotal + amountTotal) / (qtyTotal);
                    order.amountTotal = (priceTotal + amountTotal);
                }

                $scope.updateAndEnableHideOption = function(order) {
                    updatePaymentsTotal(order);
                    if ($scope.hideOptions === true) {
                        $scope.invertHideOption();
                    }
                };

                function updatePaymentsTotal(orders) {
                    $scope.resetPaymentsTotal();
                    for ( var ix in orders) {
                        var order = orders[ix];

                        var receivables = ReceivableService.listByDocument(order.uuid);
                        for ( var ix in receivables) {
                            var receivable = receivables[ix];
                            var amount = Number(receivable.amount);

                            $scope.total[receivable.type].amount += amount;
                            $scope.total[receivable.type].qty++;
                        }

                        var exchangedProducts = ProductReturnService.listByDocument(order.uuid);
                        for ( var ix in exchangedProducts) {
                            var exchanged = exchangedProducts[ix];
                            $scope.total['exchange'].amount += (exchanged.cost * exchanged.quantity);
                            $scope.total['exchange'].qty += Number(exchanged.quantity);
                        }

                        var vouchers = VoucherService.listByDocument(order.uuid);
                        for ( var idx in vouchers) {
                            var voucher = vouchers[idx];

                            var amount = Number(voucher.amount);

                            $scope.total.voucher.amount += amount;
                            $scope.total.voucher.qty += voucher.qty;
                        }
                    }
                }

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
                    $scope.total.all.avgPrice = Math.round(100 * ($scope.total.all.amount / $scope.total.all.qty)) / 100;
                }

                $scope.updateOrdersTotal = updateOrdersTotal;
                $scope.updatePaymentsTotal = updatePaymentsTotal;
                /**
                 * Watcher to filter the orders and populate the grid.
                 */
                $scope.$watchCollection('dateFilter', function() {
                    $scope.filteredOrders = angular.copy($filter('filter')(orders, $scope.filterByDate));
                    updateOrdersTotal();
                    updatePaymentsTotal($scope.filteredOrders);
                    $scope.generateVA($scope.filteredOrders);
                });

            });
}(angular));
