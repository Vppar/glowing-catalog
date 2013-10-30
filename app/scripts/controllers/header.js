(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('HeaderCtrl', function($scope, $filter,$location, DataProvider, DialogService) {

        $scope.filterQty = function(product) {
            return Boolean(product.qty);
        };

        $scope.dataProvider = DataProvider;

        $scope.$watch('dataProvider.products', function(products) {
            $scope.count = $filter('filter')(products, $scope.filterQty).length;
        }, true);
        
        $scope.openDialogInputProducts = DialogService.openDialogInputProducts;

        $scope.goToBasket = function() {
            $location.path('/basket');
        };
    });
}(angular));
