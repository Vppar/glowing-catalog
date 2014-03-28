(function (angular) {
    'use strict';
    angular
        .module('tnt.catalog.orderList.products.ctrl', [
            'tnt.catalog.order.service', 'tnt.utils.array', 'tnt.catalog.orderList.service'
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
                'OrderListService',
                function ($scope, $location, $filter, OrderService, ArrayUtils, DataProvider,
                    ReceivableService, StockService, OrderListService) {

                    $scope.filteredProducts = [];
                    $scope.filteredProducts.totalStock = 0;
                    $scope.avaliableCustomers = [];
                    $scope.checkedProductSKU = null;

                    function updateFilteredProducts () {
                        $scope.filteredProducts.totalStock = 0;
                        $scope.filteredProducts.length = 0;

                        var productsMap = {};
                        for ( var ix in $scope.filteredOrders) {
                            var order = $scope.filteredOrders[ix];
                            
                            var discountCoupom = OrderListService.getDiscountCoupomByOrder(order.uuid);
                            if(discountCoupom > 0 ){
                                OrderListService.distributeDiscountCoupon(order, discountCoupom);
                            }

                            for ( var idx in order.items) {
                                var item = order.items[idx];
                                var response = undefined;
                                if(item.SKU){
                                    var SKU = item.SKU ;
                                    response = ArrayUtils.find(productsMap, 'SKU', SKU);
                                }else{
                                    var SKU = item.title ;
                                    response = ArrayUtils.find(productsMap, 'title', SKU);
                                }
                                var discount = item.itemDiscount || item.orderDiscount || 0;

                                if (response) {
                                    // now we are computing voucher, so we need to verify which field has the amount.
                                    var itemPrice = item.price || item.amount;
                                    
                                    productsMap[SKU].qty += item.qty;
                                    var amount =
                                        Math.round(100 * (Number(item.qty) * Number(itemPrice))) / 100;

                                    productsMap[SKU].amountTotal += amount;
                                    productsMap[SKU].amountTotalWithDiscount += amount - discount;

                                } else {
                                    if(item.type){
                                        delete item.uniqueName;
                                    }
                                    productsMap[SKU] = angular.copy(item);
                                    //now we are computing voucher, so we need to verify which fild has the amount.
                                    var itemPrice = productsMap[SKU].price || productsMap[SKU].amount;
                                    
                                    productsMap[SKU].amountTotal =
                                        Math
                                            .round(100 * (Number(productsMap[SKU].qty) * Number(itemPrice))) / 100;

                                    productsMap[SKU].amountTotalWithDiscount =
                                        productsMap[SKU].amountTotal - discount;
                                    productsMap[SKU].priceAvg =
                                        Math
                                            .round(100 * (Number(productsMap[SKU].amountTotalWithDiscount) / Number(productsMap[SKU].qty))) / 100;

                                    $scope.filteredProducts.push(productsMap[SKU]);

                                    // Stock black magic

                                    var stockResponse = StockService.findInStock(item.id);

                                    if (stockResponse && stockResponse.reserve > 0) {
                                        if ((stockResponse.quantity - stockResponse.reserve) > 0) {
                                            productsMap[SKU].stock =
                                                stockResponse.quantity - stockResponse.reserve;
                                        } else {
                                            productsMap[SKU].stock = 0;
                                        }
                                    } else if (stockResponse && stockResponse.quantity > 0) {
                                        productsMap[SKU].stock = stockResponse.quantity;
                                    } else {
                                        productsMap[SKU].stock = 0;
                                    }
                                    $scope.filteredProducts.totalStock += productsMap[SKU].stock;
                                }
                                productsMap[SKU].priceAvg =
                                    Math
                                        .round(100 * (Number(productsMap[SKU].amountTotalWithDiscount) / Number(productsMap[SKU].qty))) / 100;

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
