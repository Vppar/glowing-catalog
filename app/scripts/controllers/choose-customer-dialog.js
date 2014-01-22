(function(angular) {
    'use strict';

    angular.module('tnt.catalog.customer.choose', [
        'tnt.catalog.service.data'
    ]).controller('ChooseCustomerDialogCtrl', function($scope, $q, $location, dialog, DataProvider, OrderService) {

        var order = OrderService.order;

        $scope.customers = DataProvider.customers;

        /**
         * Closes the dialog without select a customer.
         */
        $scope.cancel = function() {
            dialog.close($q.reject());
        };

        /**
         * Closes the dialog with a customer selected or redirect to the add new
         * customer screen.
         */
        $scope.confirm = function() {
            var id = 0;
            if ($scope.customerId && $scope.customerId !== '') {
                //order.customerId = Number($scope.customerId);
                id = Number($scope.customerId);
                $location.path('/payment');
            } else {
                $location.path('/add-customer');
            }
            dialog.close(id);
        };

    });
}(angular));
