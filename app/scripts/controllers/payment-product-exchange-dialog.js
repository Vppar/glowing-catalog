(function(angular) {
    'use strict';

    /**
     * PaymentProductExchangeCtrl controller
     * 
     * Controls exchange product list
     * 
     * @author Fillipe
     * 
     */

    angular.module('glowingCatalogApp').controller('PaymentProductExchangeDialogCtrl', function($scope, $filter, dialog, DataProvider) {

        /**
         * @var dataProvider - receives data from DataProvider (DataProvider.js)
         */
        $scope.dataProvider = DataProvider;
        $scope.product = {};

        /**
         * @var productList - stores product list
         */
        $scope.productList = [];

        /**
         * Function addExchangeProduct - Adds exchange product to the last
         * position of $scope.productList array
         */
        $scope.addExchangeProduct = function(product) {

            function filterProductById(filteredProduct) {
                return filteredProduct.id === Number(product.id);
            }

            if ($scope.exchangeForm.$valid && $scope.product.price > 0) {

                var productT = $filter('filter')($scope.dataProvider.products, filterProductById);
                var productListHolder = {
                    id : productT[0].id,
                    title : productT[0].title,
                    price : product.price
                };

                $scope.productList.push(productListHolder);
            }
        };

        /**
         * Removes selected product from $scope.productList array
         * 
         * @param index - position of product to be removed
         */
        $scope.remove = function remove(product) {
            $scope.productList.splice($scope.productList.indexOf(product), 1);

        };

        /**
         * Submits dialog
         */
        $scope.submitDialog = function() {
            dialog.close($scope.productList);
        };

        /**
         * Closes dialog
         */
        $scope.closeDialog = function() {
            dialog.close();
        };

    });
}(angular));
