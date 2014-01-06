(function(angular) {
    'use strict';

    angular.module('tnt.catalog.basket.add', [
        'tnt.catalog.service.data'
    ]).controller('AddToBasketDialogCtrl', function($scope, $filter, $q, dialog, OrderService, DataProvider, ArrayUtils) {

        // Find the product and make a copy to the local scope.
        var product = $filter('findBy')(OrderService.order.items, 'id', dialog.data.id);

        // var grid = ArrayUtils.innerJoin(product.gridList,
        // DataProvider.inventory, 'SKU');

        var grid = product.grid;

        var index = $filter('count')(OrderService.order.items, 'qty') - 1;
        $scope.product = product;
        $scope.qty = product.qty;
        $scope.grid = grid;
        $scope.total = 0;

        function updateTotal() {
            var total = 0;
            for ( var ix in $scope.grid) {
                total += $scope.grid[ix].qty * product.price;
            }

            $scope.total = total;
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