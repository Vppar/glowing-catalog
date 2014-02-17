(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.products.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller(
            'OrderListProductsCtrl',
            function($scope, $location, $filter, OrderService, ArrayUtils, DataProvider, ReceivableService, StockService,
                    ProductReturnService, VoucherService) {

                // $scope.entities come from OrderListCtrl
                var entities = $scope.entities;
                var orders = $scope.orders;

                // $scope.filteredOrders come from OrderListCtrl
                $scope.filteredOrders = angular.copy(orders);
                $scope.filteredProducts = [];
                $scope.filteredProducts.totalStock = 0;

                for ( var ix in orders) {
                    var order = orders[ix];
                    // Find the entity name
                    order.entityName = ArrayUtils.find(entities, 'uuid', order.customerId).name;
                    var filteredItems = $filter('filter')(order.items, function(item) {
                        var result = false;
                        if (item.type !== 'giftCard' && item.type !== 'voucher') {
                            result = true;
                        }
                        return result;
                    });
                    var qtyTotal = $filter('sum')(filteredItems, 'qty');
                    var priceTotal = $filter('sum')(filteredItems, 'price', 'qty');

                    order.itemsQty = qtyTotal;
                    order.avgPrice = Math.round(100 * (priceTotal / qtyTotal)) / 100;
                    order.amountTotal = priceTotal;
                }

                function updateFilteredProducts() {
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
                                    productsMap[SKU].priceTotal += Math.round(100 * (Number(item.qty) * Number(item.price))) / 100;

                                } else {
                                    productsMap[SKU] = angular.copy(item);
                                    productsMap[SKU].priceTotal =
                                            Math.round(100 * (Number(productsMap[SKU].qty) * Number(productsMap[SKU].price))) / 100;

                                    productsMap[SKU].priceAvg =
                                            Math.round(100 * (Number(productsMap[SKU].priceTotal) / Number(productsMap[SKU].qty))) / 100;

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
                                        Math.round(100 * (Number(productsMap[SKU].priceTotal) / Number(productsMap[SKU].qty))) / 100;

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
                
                function generateVa(filteredProducts){
                    for ( var ix in filteredProducts) {
                        var filteredProduct = filteredProducts[ix];
                        filteredProduct.va = (filteredProduct.priceTotal/$scope.total.all.amount)*100;
                    }
                }

                $scope.$watchCollection('dateFilter', function() {
                    $scope.filteredOrders = angular.copy($filter('filter')(orders, $scope.filterByDate));
                    $scope.filteredOrders = angular.copy($filter('filter')($scope.filteredOrders, $scope.filterByClient));
                    updateFilteredProducts();
                    updateOrdersTotal();
                    updatePaymentsTotal($scope.filteredOrders);
                    generateVa($scope.filteredProducts);
                });

                $scope.$watchCollection('filter.customerId', function() {
                    $scope.filteredOrders = angular.copy($filter('filter')(orders, $scope.filterByDate));
                    $scope.filteredOrders = angular.copy($filter('filter')($scope.filteredOrders, $scope.filterByClient));
                    updateFilteredProducts();
                    updateOrdersTotal();
                    //updatePaymentsTotal($scope.filteredOrders);
                    generateVa($scope.filteredProducts);
                });

            });
}(angular));