(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.products.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller(
            'OrderListProductsCtrl',
            ['$scope', '$location', '$filter', 'OrderService', 'ArrayUtils', 'DataProvider', 'ReceivableService', 'StockService', 'ProductReturnService', 'VoucherService',
            function($scope, $location, $filter, OrderService, ArrayUtils, DataProvider, ReceivableService, StockService,
                    ProductReturnService, VoucherService) {

                $scope.filteredProducts = [];
                $scope.filteredProducts.totalStock = 0;

                function updateFilteredProducts() {
                    $scope.filteredProducts.totalStock = 0;
                    $scope.filteredProducts.length = 0;
                    var productsMap = {};
                    for ( var ix in $scope.filteredOrders) {
                        for ( var idx in $scope.filteredOrders[ix].items) {
                            var item = $scope.filteredOrders[ix].items[idx];
                            if (item.type !== 'giftCard' && item.type !== 'voucher') {
                                var SKU = item.SKU;
                                var response = ArrayUtils.find(productsMap, 'SKU', SKU);
                                if (response) {
                                    productsMap[SKU].qty += item.qty;
                                    productsMap[SKU].amountTotal += Math.round(100 * (Number(item.qty) * Number(item.price))) / 100;

                                } else {
                                    productsMap[SKU] = angular.copy(item);
                                    productsMap[SKU].amountTotal =
                                            Math.round(100 * (Number(productsMap[SKU].qty) * Number(productsMap[SKU].price))) / 100;

                                    productsMap[SKU].priceAvg =
                                            Math.round(100 * (Number(productsMap[SKU].amountTotal) / Number(productsMap[SKU].qty))) / 100;

                                    $scope.filteredProducts.push(productsMap[SKU]);

                                    // Stock black magic

                                    var stockResponse = StockService.findInStock(item.id);

                                    if (stockResponse.reserve > 0) {
                                        if ((stockResponse.quantity - stockResponse.reserve) > 0) {
                                            productsMap[SKU].stock = stockResponse.quantity;
                                        } else {
                                            productsMap[SKU].stock = 0;
                                        }
                                    } else if (stockResponse.quantity > 0) {
                                        productsMap[SKU].stock = stockResponse.quantity;
                                    } else {
                                        productsMap[SKU].stock = 0;
                                    }
                                    $scope.filteredProducts.totalStock += productsMap[SKU].stock;
                                }
                                productsMap[SKU].priceAvg =
                                        Math.round(100 * (Number(productsMap[SKU].amountTotal) / Number(productsMap[SKU].qty))) / 100;

                            }
                        }
                    }
                }

                $scope.$watchCollection('dtFilter', function() {
                    updateFilteredProducts();
                    $scope.generateVA($scope.filteredProducts);
                });

                $scope.$watchCollection('filter.customerId', function() {
                    /*$scope.filteredOrders = angular.copy($filter('filter')(orders, $scope.filterByDate));
                    $scope.filteredOrders = angular.copy($filter('filter')($scope.filteredOrders, $scope.filterByClient));
                    updateFilteredProducts();
                    updateOrdersTotal();
                    $scope.generateVA($scope.filteredProducts);*/
                });

            }]);
}(angular));
