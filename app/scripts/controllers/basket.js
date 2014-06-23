(function (angular) {
    'use strict';

    angular.module('tnt.catalog.basket', [
        'tnt.catalog.service.data'
    ]).controller(
        'BasketCtrl',
        [
            '$scope',
            '$location',
            'OrderService',
            'UserService',
            function ($scope, $location, OrderService, UserService) {

                UserService.redirectIfInvalidUser();

                $scope.order = OrderService.order;

                // FIXME: is it safe to remove this? (see views/basket.html)
                $scope.inBasketFilter = function inBasketFilter (item) {
                    return Boolean(item.qty);
                };

                $scope.remove = function remove (product) {
                    delete product.qty;
                };

                $scope.pay = function () {
                    $location.path('/payment');
                };
            }
        ]);
})(angular);
