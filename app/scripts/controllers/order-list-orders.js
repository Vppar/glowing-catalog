(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.orders.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller('OrderListOrdersCtrl', function($scope, $location, $filter, ArrayUtils, ReceivableService, ProductReturnService, VoucherService) {

        // $scope.entities come from OrderListCtrl
        var entities = $scope.entities;
        var orders = $scope.orders;

        // $scope.filteredOrders come from OrderListCtrl
        $scope.filteredOrders = angular.copy(orders);

        $scope.selectOrder = function selectOrder(order) {
            updateOrdersTotal(order);
        };

        for ( var ix in orders) {
            var order = orders[ix];
            // Find the entity name
            order.entityName = ArrayUtils.find(entities, 'id', order.customerId).name;

            var qtyTotal = $filter('sum')(order.items, 'qty');
            var amountTotal = $filter('sum')(order.items, 'price', 'qty');

            order.itemsQty = qtyTotal;
            order.avgPrice = (amountTotal) / (qtyTotal);
            order.amountTotal = amountTotal;
        }

        function updateOrdersTotal(order) {
            var filteredOrders = null;
            if (order) {
                filteredOrders = [
                    order
                ];
            } else {
                filteredOrders = $scope.filteredOrders;
            }
            $scope.resetTotal();
            for ( var ix in filteredOrders) {
                var order = filteredOrders[ix];
                var receivables = ReceivableService.listByDocument(order.uuid);
                for ( var ix in receivables) {
                    var receivable = receivables[ix];
                    $scope.total[receivable.type].amount += receivable.amount;
                    $scope.total.all.amount += receivable.amount;

                    $scope.total[receivable.type].qty++;
                    $scope.total.all.qty++;
                }

                var exchangedProducts = ProductReturnService.listByDocument(order.uuid);
                for ( var ix in exchangedProducts) {
                    var exchanged = exchangedProducts[ix];
                    $scope.total['exchange'].amount += (exchanged.cost * exchanged.quantity);
                    $scope.total.all.amount += exchanged.cost;
                    $scope.total['exchange'].qty += exchanged.quantity;
                }

                var vouchers = VoucherService.listByDocument(order.uuid);
                console.log('>>>', vouchers);
                for ( var idx in vouchers) {
                    var voucher = vouchers[idx];
                    console.log(voucher);
                    $scope.total.voucher.amount += (voucher.amount * (voucher.qty || 1));
                    $scope.total.all.amount += voucher.amount;
                    $scope.total.voucher.qty += voucher.qty;
                }
            }
        }

        // #############################################################################################################
        // Watchers
        // #############################################################################################################

        /**
         * Watcher to filter the orders and populate the grid.
         */
        $scope.$watchCollection('dateFilter', function() {
            $scope.filteredOrders = angular.copy($filter('filter')(orders, $scope.filterByDate));
            updateOrdersTotal();
        });

    });
}(angular));
