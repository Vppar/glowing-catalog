(function(angular) {
    'use strict';

    angular.module('tnt.catalog.basket', [
        'tnt.catalog.service.data'
    ]).controller('BasketCtrl', function($scope, $location, OrderService) {

        $scope.order = OrderService.order;
        $scope.inBasketFilter = OrderService.inBasketFilter;

        $scope.remove = function remove(product) {
            delete product.qty;
        };

        $scope.pay = function() {
            $location.path('/payment');
        };

    });
}(angular));