(function(angular) {
    'use strict';

    angular.module('tnt.catalog.customer.choose', [
        'tnt.catalog.service.data', 'tnt.catalog.entity.service'
    ]).controller('ChooseCustomerDialogCtrl', function($scope, $q, $location, dialog, OrderService, EntityService) {

        $scope.hideNativeKeyboard = function hideNativeKeyboard(event) {
            var element = angular.element(event.target);
            console.log(element.blur);
            element.blur();
        };

        $scope.customers = EntityService.list().sort(function(x, y) {
            return ((x.name === y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
        });

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
            var uuid = 0;
            if ($scope.customerId && $scope.customerId !== '') {
                uuid = $scope.customerId;
                $location.path('/payment');
            } else {
                $location.path('/add-customer');
            }
            dialog.close(uuid);
        };

    });
}(angular));
