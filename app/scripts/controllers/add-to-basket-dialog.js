(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller(
            'AddToBasketDialogCtrl', function($scope, $filter, $dialog, dialog, DataProvider, OrderService, DialogService) {

                $scope.product = $filter('filter')(DataProvider.products, {
                    id : dialog.id
                })[0];

                $scope.cancel = function() {
                    delete $scope.product.qty;
                    dialog.close();
                };

                $scope.add = function() {
                    if (!OrderService.order.customerId) {
                        DialogService.openDialogChooseCustomer();
                    }
                    dialog.close();
                };
                console.log($scope.product);
            });
}(angular));