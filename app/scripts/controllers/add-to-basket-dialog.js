(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('AddToBasketDialogCtrl', function($scope, $filter, $dialog, dialog, DataProvider, OrderService) {

        $scope.product = $filter('filter')(DataProvider.products, {
            id : dialog.id
        })[0];

        $scope.cancel = function() {
            delete $scope.product.qty;
            dialog.close();
        };

        $scope.add = function() {
            if (!OrderService.order.customerId) {
                var d = $dialog.dialog({
                    backdropClick : true,
                    dialogClass : 'modal'
                });
                d.open('views/parts/global/choose-customer-dialog.html', 'ChooseCustomerDialogCtrl');
            }
            dialog.close();
        };

    });
}(angular));