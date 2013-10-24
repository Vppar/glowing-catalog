(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('HeaderCtrl', function($scope, $filter, DataProvider) {

        $scope.filterQty = function(product) {
            return Boolean(product.qty);
        };

        $scope.products = DataProvider.products;

        $scope.$watch('products', function(products) {
            $scope.count = $filter('filter')(products, $scope.filterQty).length;
        }, true);

    });
}(angular));