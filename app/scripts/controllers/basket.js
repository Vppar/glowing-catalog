(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('BasketCtrl', function($scope, $dialog, $location, DataProvider, DialogService, OrderService) {

        $scope.dataProvider = DataProvider;
        $scope.order = OrderService.order;
        
        $scope.remove = function remove(product) {
            delete product.qty;
        };

        $scope.filterQty = function(product) {
            return Boolean(product.qty);
        };

        $scope.openDialogEditPass = DialogService.openDialogEditPass;
        $scope.openDialogChooseCustomer = DialogService.openDialogChooseCustomer;

        $scope.pay = function() {
            $location.path('/payment');
        };

    });
}(angular));