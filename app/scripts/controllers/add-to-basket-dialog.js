(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('AddToBasketDialogCtrl', function($scope, $dialog, $q, $filter, dialog, DataProvider) {

        /**
         * Find the product and make a copy to the local scope.
         */
        var product = angular.copy($filter('findBy')(DataProvider.products, 'id', dialog.data.id));
        $scope.product = product;

        /**
         * Closes the dialog telling the caller to add the product to the
         * basket.
         */
        $scope.addToBasket = function addToBasket() {
            dialog.close(product);
        };

        /**
         * Closes the dialog telling the caller not to add the product to the
         * basket.
         */
        $scope.close = function close() {
            dialog.close($q.reject());
        };
    });
}(angular));