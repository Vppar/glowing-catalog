(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('HeaderCtrl', function($scope, $filter, DataProvider) {

        $scope.filterQtde = function(product) {
            return Boolean(product.qtde);
        };

        $scope.products = DataProvider.products;

        $scope.$watch('products', function(products) {
            $scope.count = $filter('filter')(products, $scope.filterQtde).length;
        }, true);
        
       

    });
}(angular));