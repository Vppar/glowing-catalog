'use strict';

angular.module('tnt.catalog.productsDeliveredProducts', [
    'tnt.catalog.user', 'tnt.catalog.order.service'
]).controller('ProductsDeliveredProductsCtrl', [
    '$scope', function ($scope) {

        $scope.sumarizatorOrders($scope.delivered, $scope.deliveredOrdersTotals);

        // $scope.selected=toBeDeliveredProducts
        // $scope.selected=deliveredProducts
        
        $scope.cancel = function () {
            $scope.selectedOrder.selectedOrderProducts = {};
            $scope.selected.tab = 'delivered';
        };
        
    }
]);
