(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('BasketCtrl', function($scope, $dialog, $location, DialogService, OrderService) {

        $scope.basket = OrderService.getBasket();

        $scope.remove = function remove(product) {
            OrderService.removeFromBasket(product.id);
        };

        $scope.pay = function() {
            $location.path('/payment');
        };

    });
}(angular));