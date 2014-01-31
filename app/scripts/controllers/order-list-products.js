(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.products.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller(
            'OrderListProductsCtrl',
            function($scope, $location, $filter, OrderService, ArrayUtils, DataProvider, ReceivableService, ProductReturnService) {

                // $scope.entities come from OrderListCtrl
                $scope.filteredOrders = [];
                $scope.products = [];
                $scope.$watchCollection('dateFilter', function() {
                    $scope.filteredOrders = angular.copy($filter('filter')(angular.copy($scope.orders), $scope.filterByDate));
                    consolidadteProducts();
                    updateOrdersTotal();
                });

                function consolidadteProducts() {
                    $scope.products.length = 0;
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
                                $scope.products.push(productsMap[SKU]);
                            }
                        }
                    }
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
                    }
                }

            });
}(angular));