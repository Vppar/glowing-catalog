(function(angular) {
    'use strict';

    angular.module('tnt.catalog.basket', [
        'tnt.catalog.service.data'
    ]).controller('BasketCtrl', function($scope, $location, OrderService) {

        $scope.order = OrderService.order;

        // FIXME: Should this be converted to a filter?
        $scope.inBasketFilter = function inBasketFilter(item) {
          return Boolean(item.qty);
        }

        $scope.remove = function remove(product) {
            delete product.qty;
        };

        $scope.pay = function() {
            $location.path('/payment');
        };

    });
}(angular));
