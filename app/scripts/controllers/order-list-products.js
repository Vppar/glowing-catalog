(function (angular) {
    'use strict';
    angular
        .module('tnt.catalog.orderList.products.ctrl', [
            'tnt.catalog.order.service', 'tnt.utils.array'
        ])
        .controller(
            'OrderListProductsCtrl',
            [
                '$scope',
                '$location',
                '$filter',
                'OrderService',
                'ArrayUtils',
                'DataProvider',
                'ReceivableService',
                'StockService',
                function ($scope, $location, $filter, OrderService, ArrayUtils, DataProvider,
                    ReceivableService, StockService) {

                    $scope.filteredProducts = [];
                    $scope.filteredProducts.totalStock = 0;
                    $scope.avaliableCustomers = [];
                    $scope.checkedProductSKU = null;

                    function updateFilteredProducts () {
                        $scope.filteredProducts.totalStock = 0;
                        $scope.filteredProducts.length = 0;
                        var productsMap = {};
                        for ( var ix in $scope.filteredOrders) {
                            for ( var idx in $scope.filteredOrders[ix].items) {
                                var item = $scope.filteredOrders[ix].items[idx];
                                if (item.type !== 'giftCard' && item.type !== 'voucher') {
                                    var SKU = item.SKU;
                                    var response = ArrayUtils.find(productsMap, 'SKU', SKU);

                                    var discount = item.itemDiscount || 0;

                                    if (response) {
                                        productsMap[SKU].qty += item.qty;
                                        var amount =
                                            Math
                                                .round(100 * (Number(item.qty) * Number(item.price))) / 100;

                                        productsMap[SKU].amountTotal += amount;
                                        productsMap[SKU].amountTotalWithDiscount +=
                                            amount - discount;

                                    } else {
                                        productsMap[SKU] = angular.copy(item);
                                        productsMap[SKU].amountTotal =
                                            Math
                                                .round(100 * (Number(productsMap[SKU].qty) * Number(productsMap[SKU].price))) / 100;

                                        productsMap[SKU].amountTotalWithDiscount =
                                            productsMap[SKU].amountTotal - discount;
                                        productsMap[SKU].priceAvg =
                                            Math
                                                .round(100 * (Number(productsMap[SKU].amountTotalWithDiscount) / Number(productsMap[SKU].qty))) / 100;

                                        $scope.filteredProducts.push(productsMap[SKU]);

                                        // Stock black magic

                                        var stockResponse = StockService.findInStock(item.id);

                                        if (stockResponse.reserve > 0) {
                                            if ((stockResponse.quantity - stockResponse.reserve) > 0) {
                                                productsMap[SKU].stock =
                                                    stockResponse.quantity - stockResponse.reserve;
                                            } else {
                                                productsMap[SKU].stock = 0;
                                            }
                                        } else if (stockResponse.quantity > 0) {
                                            productsMap[SKU].stock = stockResponse.quantity;
                                        } else {
                                            productsMap[SKU].stock = 0;
                                        }
                                        $scope.filteredProducts.totalStock +=
                                            productsMap[SKU].stock;
                                    }
                                    productsMap[SKU].priceAvg =
                                        Math
                                            .round(100 * (Number(productsMap[SKU].amountTotalWithDiscount) / Number(productsMap[SKU].qty))) / 100;

                                }
                            }
                        }
                    }

                    $scope.updateProducts =
                        function () {
                            $scope.filteredOrders = $scope.filterOrders($scope.orders);
                            if ($scope.customerId !== '0') {
                                $scope.filteredOrders =
                                    $filter('filter')($scope.filteredOrders, $scope.filterByClient);
                            }

                            $scope.updateOrdersTotal($scope.filteredOrders);
                            updateFilteredProducts();
                            $scope.computeAvaliableCustomers($scope.customers);
                            $scope.generateVA($scope.filteredProducts);
                        };

                    $scope.updateProducts();

                    $scope.$watchCollection('dtFilter', function () {
                        $scope.updateProducts();
                    });

                    $scope.$watch('customerId', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            $scope.updateProducts();
                        }
                    });

                }
            ]);
}(angular));
