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
                'logger',
                'OrderService',
                'ArrayUtils',
                'DataProvider',
                'ReceivableService',
                'StockService',
                'OrderListService',
                'BookService',
                function ($scope, $location, $filter, logger, OrderService, ArrayUtils, DataProvider,
                    ReceivableService, StockService, OrderListService, BookService) {
                    
                    var log = logger.getLogger('tnt.catalog.orderList.products.ctrl');
                    
                    var allBookEntries = BookService.listEntries();
                    
                    function updateFilteredProducts (orders) {
                        $scope.filteredProducts.totalStock = 0;
                        $scope.filteredProducts.length = 0;
                        var productsMap = {};
                        for ( var ix in orders) {
                            var order = orders[ix];
                            var discountCoupom = OrderListService.getDiscountCoupomByOrder(order.uuid, allBookEntries);
                            
                            if(discountCoupom > 0 ){
                                OrderListService.distributeDiscountCoupon(order, discountCoupom);
                            }
                            
                            for ( var idx in order.items) {
                                var item = order.items[idx];
                                var response = undefined;
                                
                                if(item.SKU){
                                    var SKU = item.SKU ;
                                    response = ArrayUtils.find(productsMap, 'SKU', SKU);
                                
                                
                                    var discount = item.itemDiscount || item.orderDiscount || 0;
                                    discount += item.specificDiscount || 0;
    
                                    if (response ) {
                                        // now we are computing voucher, so we need to verify which field has the amount.
                                        var itemPrice = item.price;
                                        
                                        productsMap[SKU].qty += item.qty;
                                        var amount =
                                            Math.round(100 * (Number(item.qty) * Number(itemPrice))) / 100;
    
                                        productsMap[SKU].amountTotal += amount;
                                        productsMap[SKU].amountTotalWithDiscount += amount - discount;
                                    } else {
                                        productsMap[SKU] = angular.copy(item);
    
                                        var itemPrice = productsMap[SKU].price;
                                        
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

                                }else{
                                    log.info('Item is a voucher not counting on product list', item);
                                }
                            }
                        }
                    }
                    
                    $scope.updateProducts =
                        function () {
                            var orders = angular.copy($scope.filteredOrders); 
                            if ($scope.customerId !== '0') {
                                orders =
                                    $filter('filter')(orders, $scope.filterByClient);
                            }

                            $scope.updateOrdersTotal(orders);
                            updateFilteredProducts(orders);
                            $scope.computeAvaliableCustomers($scope.customers);
                            $scope.generateVA($scope.filteredProducts);
                        };
                    
                    $scope.updateProducts();
                    
                    $scope.$watch('customerId', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            $scope.updateProducts();
                        }
                    });
                    
                    $scope.$on('dtFilterUpdated', function(e) {  
                        $scope.updateProducts();
                    });
                    
                }
            ]);
}(angular));
