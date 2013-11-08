(function(angular) {
    'use strict';

    angular.module('tnt.catalog.basket.add', [
        'tnt.catalog'
    ]).controller('AddToBasketDialogCtrl', function($scope, $filter, $q, dialog, OrderService) {

        // Find the product and make a copy to the local scope.
        var product = $filter('findBy')(OrderService.order.items, 'id', dialog.data.id);
        $scope.product = product;
        $scope.qty = product.qty;

        /**
         * Closes the dialog telling the caller to add the product to the
         * basket.
         */
        $scope.addToBasket = function addToBasket() {
            product.qty = $scope.qty;
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