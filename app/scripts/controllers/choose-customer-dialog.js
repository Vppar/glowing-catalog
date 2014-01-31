(function(angular) {
    'use strict';

    angular.module('tnt.catalog.customer.choose', [
        'tnt.catalog.service.data', 'tnt.catalog.entity.service'
    ]).controller('ChooseCustomerDialogCtrl', function($scope, $q, $location, dialog, OrderService, EntityService) {

        var order = OrderService.order;

        $scope.customers = EntityService.list();

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
                id = $scope.customerId;
                $location.path('/payment');
            } else {
                $location.path('/add-customer');
            }
            dialog.close(id);
        };

    });
}(angular));
