(function(angular) {
    'use strict';

    angular.module('tnt.catalog.customer.choose', [
        'tnt.catalog'
    ]).controller('ChooseCustomerDialogCtrl', function($scope, dialog, $location, DataProvider, OrderService) {

        $scope.customers = DataProvider.customers;
        $scope.customerId = undefined;

        $scope.cancel = function() {
            dialog.close();
        };

        $scope.goToAddCustomer = function() {
            if ($scope.selectedCustomerIdx && $scope.selectedCustomerIdx !== '') {
                OrderService.order.customerId = $scope.customerId;
            } else {
                $location.path('add-customer');
            }
            dialog.close();
        };

    });
}(angular));