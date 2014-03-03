(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.products.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller(
            'OrderListProductsCtrl',
            ['$scope', '$location', '$filter', 'OrderService', 'ArrayUtils', 'DataProvider', 'ReceivableService', 'StockService', 'ProductReturnService', 'VoucherService',
            function($scope, $location, $filter, OrderService, ArrayUtils, DataProvider, ReceivableService, StockService,
                    ProductReturnService, VoucherService) {

                // $scope.entities come from OrderListCtrl
                var entities = $scope.entities;
                var orders = $scope.orders;

                // $scope.filteredOrders come from OrderListCtrl
                $scope.filteredOrders = angular.copy(orders);
                $scope.filteredProducts = [];
                $scope.filteredProducts.totalStock = 0;

                var filterByType = function(item) {
                    var result = false;
                    if (item.type !== 'giftCard' && item.type !== 'voucher') {
                        result = true;
                    }
                    return result;
                };

                for ( var ix in orders) {
                    var order = orders[ix];
                    // Find the entity name
                    var entity = ArrayUtils.find(entities, 'uuid', order.customerId);
                    if (entity) {
                        order.entityName = entity.name;
                    } else {
                        order.entityName = '';
                    }
                    var filteredItems = $filter('filter')(order.items, filterByType);
                    var qtyTotal = $filter('sum')(filteredItems, 'qty');
                    var amountTotal = $filter('sum')(filteredItems, 'price', 'qty');

                    order.itemsQty = qtyTotal;
                    order.avgPrice = Math.round(100 * (amountTotal / qtyTotal)) / 100;
                    order.amountTotal = amountTotal;
                }

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

                    var avgPrice = Math.round(100 * ($scope.total.all.amount / $scope.total.all.qty)) / 100;
                    if (!isNaN(avgPrice)) {
                        $scope.total.all.avgPrice = avgPrice;
                    } else {
                        $scope.total.all.avgPrice = 0;
                    }
                }

                $scope.$watchCollection('dateFilter', function() {
                    $scope.filteredOrders = angular.copy($filter('filter')(orders, $scope.filterByDate));
                    $scope.filteredOrders = angular.copy($filter('filter')($scope.filteredOrders, $scope.filterByClient));
                    updateFilteredProducts();
                    updateOrdersTotal();
                    $scope.updatePaymentsTotal($scope.filteredOrders);
                    $scope.generateVA($scope.filteredProducts);
                });

                $scope.$watchCollection('filter.customerId', function() {
                    $scope.filteredOrders = angular.copy($filter('filter')(orders, $scope.filterByDate));
                    $scope.filteredOrders = angular.copy($filter('filter')($scope.filteredOrders, $scope.filterByClient));
                    updateFilteredProducts();
                    updateOrdersTotal();
                    $scope.generateVA($scope.filteredProducts);
                });

            }]);
}(angular));
