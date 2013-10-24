(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('ChooseCustomerDialogCtrl', function($scope, dialog, $location, DataProvider) {

        $scope.dataProvider = DataProvider;
        $scope.selectedCustomerIdx = '';

        $scope.cancel = function() {
            dialog.close();
        };
        
        $scope.goToAddCustomer = function() {
            if ($scope.selectedCustomerIdx && $scope.selectedCustomerIdx !== '') {
                DataProvider.customer = DataProvider.customers[$scope.selectedCustomerIdx];
                $location.path('/');
            } else {
                $location.path('add-customer');
            }
            dialog.close();
        };

    });
}(angular));