'use strict';

angular.module('tnt.catalog.productsDeliveredProducts', [
    'tnt.catalog.user', 'tnt.catalog.order.service'
]).controller('ProductsDeliveredProductsCtrl', [
    '$scope','ArrayUtils', function ($scope, ArrayUtils) {

        $scope.sumarizatorOrders($scope.delivered, $scope.deliveredOrdersTotals);

        $scope.cancel = function () {
            $scope.selectedOrder.selectedOrderProducts = {};
            $scope.selected.tab = 'delivered';
        };
        warmup();
        function warmup(){
            if($scope.selectedOrder.schedule){
                for(var ix in $scope.selectedOrder.selectedOrderProducts){
                    var product = $scope.selectedOrder.selectedOrderProducts[ix];
                    var sProduct = ArrayUtils.find($scope.selectedOrder.schedule.items,'id', product.id);
                    if(sProduct){
                        product.deliveredDate = sProduct.deliveredDate;
                    }
                }
            }
        }
        
    }
]);
