(function(angular) {
    'use strict';

    angular.module('tnt.catalog.basket.add', [
        'tnt.catalog.service.data'
    ]).controller('AddToBasketDialogCtrl', function($scope, $filter, $q, dialog, OrderService, DataProvider, ArrayUtils, InventoryKeeper) {

        var inventory = InventoryKeeper.read();

        // Find the product and make a copy to the local scope.
        var product = ArrayUtils.find(DataProvider.products, 'id', dialog.data.id);

        // find the grid
        var grid = angular.copy(ArrayUtils.list(inventory, 'parent', dialog.data.id));

        var index = OrderService.order.items.length - 1;
        $scope.product = product;
        $scope.grid = grid;
        $scope.total = 0;

        function updateTotal() {
            var total = 0, count = 0;
            for ( var ix in $scope.grid) {
                total += $scope.grid[ix].qty * product.price;
                count += $scope.grid[ix].qty;
            }

            $scope.total = total;
            $scope.count = count;
        }

        for ( var ix in $scope.grid) {
            $scope.grid[ix].qty = 0;
            $scope.$watch('grid[' + ix + '].qty', updateTotal);
        }

        /**
         * Closes the dialog telling the caller to add the product to the
         * basket.
         */
        $scope.addToBasket = function addToBasket() {
            
            var product = ArrayUtils.find(OrderService.order.items, 'id', dialog.data.id);
            
            product.qty = $scope.qty;
            product.idx = product.idx ? product.idx : (index + 1);
            
            dialog.close(true);
        };

        /**
         * Closes the dialog telling the caller not to add the product to the
         * basket.
         */
        $scope.cancel = function cancel() {
            dialog.close($q.reject());
        };
    });
}(angular));