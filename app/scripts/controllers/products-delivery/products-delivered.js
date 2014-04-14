'use strict';

angular.module('tnt.catalog.productsDelivered', [
    'tnt.catalog.user', 'tnt.catalog.order.service'
]).controller('ProductsDeliveredCtrl', [
    '$scope', function ($scope) {

        $scope.sumarizatorOrders($scope.delivered, $scope.deliveredOrdersTotals);
        
        $scope.getItems = function (order) {
            $scope.selectedOrder.selectedOrderProducts = getPendingProducts(order);
            $scope.selected.tab = 'deliveredProducts';
        };

        // #################################################################################################################
        // Pending Items
        // #################################################################################################################

        var getPendingProducts = function getPendingProducts (order) {
            var pendingProducts = [];
            $scope.selectedOrder.uuid = order.uuid;
            $scope.selectedOrder.customerName = order.customerName;
            $scope.selectedOrder.phone = order.phone;
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

                pendingProducts.push(item);
            }
            return pendingProducts;
        };
    
    
    }
]);
