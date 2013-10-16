(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('ChooseCustomerDialogCtrl', function($scope, dialog, $location, DataProvider) {

        $scope.dataProvider = DataProvider;
        $scope.selectedCustomer = '';

        $scope.cancel = function() {
            dialog.close();
        };

        $scope.goToAddCustomer = function() {
            if ($scope.selectedCustomer && $scope.selectedCustomer !== '') {
                DataProvider.customer = $scope.selectedCustomer;
                $location.path('/');
            } else {
                $location.path('add-customer');
            }
            dialog.close();
        };

    });
}(angular));