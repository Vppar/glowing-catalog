(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.products.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller(
            'OrderListProductsCtrl',
            function($scope, $location, $filter, OrderService, ArrayUtils, DataProvider, ReceivableService, ProductReturnService,
                    VoucherService) {

                // $scope.entities come from OrderListCtrl
                var entities = $scope.entities;
                var orders = $scope.orders;

                // $scope.filteredOrders come from OrderListCtrl
                $scope.filteredOrders = angular.copy(orders);
                $scope.filteredProducts = [];

                for ( var ix in orders) {
                    var order = orders[ix];
                    // Find the entity name
                    order.entityName = ArrayUtils.find(entities, 'uuid', order.customerId).name;

                    var qtyTotal = $filter('sum')(order.items, 'qty');
                    var amountTotal = $filter('sum')(order.items, 'price', 'qty');

                    order.itemsQty = qtyTotal;
                    order.avgPrice = (amountTotal) / (qtyTotal);
                    order.amountTotal = amountTotal;
                }

                function updateFilteredProducts() {
                    $scope.filteredProducts.length = 0;
                    var productsMap = {};
                    for ( var ix in $scope.filteredOrders) {
                        for ( var idx in $scope.filteredOrders[ix].items) {
                            if ($scope.filteredOrders[ix].items[idx].type !== 'giftCard' &&
                                $scope.filteredOrders[ix].items[idx].type !== 'voucher') {
                                var SKU = $scope.filteredOrders[ix].items[idx].SKU;
                                var response = ArrayUtils.find(productsMap, 'SKU', SKU);
                                if (response != -1) {
                                    productsMap[SKU] = ($scope.filteredOrders[ix].items[idx]);
                                    productsMap[SKU].priceTotal = (productsMap[SKU].qty * productsMap[SKU].price);
                                    productsMap[SKU].priceAvg = (productsMap[SKU].priceTotal / productsMap[SKU].qty);
                                } else {
                                    productsMap[SKU].qty += $scope.filteredOrders[ix].items[idx].qty;
                                    productsMap[SKU].priceTotal += (productsMap[SKU].qty * productsMap[SKU].price);
                                    productsMap[SKU].priceAvg = (productsMap[SKU].priceTotal / productsMap[SKU].qty);
                                }
                                productsMap[SKU].stock = 0;
                                $scope.filteredProducts.push(productsMap[SKU]);
                            }
                        }
                    }
                }

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
                    var filteredOrders = $scope.filteredOrders;
                    for ( var ix in filteredOrders) {
                        var filteredOrder = filteredOrders[ix];

                        $scope.total.all.amount += filteredOrder.amountTotal;
                        $scope.total.all.qty += filteredOrder.itemsQty;
                        $scope.total.all.orderCount++;
                    }
                    $scope.total.all.productCount = $scope.filteredProducts.length;
                    $scope.total.all.avgPrice = Math.round(100 * ($scope.total.all.amount / $scope.total.all.qty)) / 100;
                }

                $scope.$watchCollection('dateFilter', function() {
                    $scope.filteredOrders = angular.copy($filter('filter')(orders, $scope.filterByDate));
                    updateFilteredProducts();
                    updateOrdersTotal();
                    updatePaymentsTotal($scope.filteredOrders);
                });

            });
}(angular));