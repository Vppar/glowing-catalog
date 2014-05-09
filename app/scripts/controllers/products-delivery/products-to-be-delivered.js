(function(angular){
    'use strict';
    
    angular.module('tnt.catalog.productsToBeDelivery', []).controller('ProductsToBeDeliveryCtrl', [
        '$scope', 'logger', 'StockService', function($scope, logger, StockService) {
    
            $scope.sumarizatorOrders($scope.toBeDelivered, $scope.toBeDeliveredOrdersTotals);
    
            // $scope.selected=toBeDeliveredProducts
            // $scope.selected=deliveredProducts
    
            $scope.getItems = function(order) {
                $scope.selectedOrder.selectedOrderProducts = getPendingProducts(order);
                $scope.selected.tab = 'toBeDeliveredProducts';
            };
    
            // #################################################################################################################
            // Pending Items
            // #################################################################################################################
    
            var getPendingProducts = function getPendingProducts(order) {
                var pendingProducts = [];
                $scope.selectedOrder.uuid = order.uuid;
                $scope.selectedOrder.created = order.created;
                $scope.selectedOrder.customerName = order.customerName;
                $scope.selectedOrder.phone = order.phone;
                $scope.selectedOrder.schedule = order.schedule;
                for ( var ix in order.items) {
                    var item = order.items[ix];
                    item.order = order.code;
                    item.created = order.created;
                    // Build unique name.
                    if (item.option) {
                        item.uniqueName = item.SKU + ' - ' + item.option;
                    } else {
                        item.uniqueName = item.SKU;
                    }
                    var stock = StockService.findInStock(item.id);
                    item.stock = stock.quantity;
                    
                    var remaining = (item.qty - item.dQty);
                    if (remaining === 0) {
                        item.maxDeliver = 0;
                    } else if (remaining > item.stock) {
                        item.maxDeliver = item.stock;
                    } else {
                        item.maxDeliver = remaining;
                    }
    
                    pendingProducts.push(item);
                }
                return pendingProducts;
            };
    
        }
    ]);
})(angular);