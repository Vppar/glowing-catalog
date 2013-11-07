(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller(
            'ChooseCustomerDialogCtrl', function($scope, dialog, $location, DataProvider, OrderService) {

                $scope.dataProvider = DataProvider;
                $scope.selectedCustomerIdx = '';

                $scope.cancel = function() {
                    dialog.close();
                };

                $scope.goToAddCustomer = function() {
                    if ($scope.selectedCustomerIdx && $scope.selectedCustomerIdx !== '') {
                        OrderService.setCustomerId(DataProvider.customers[$scope.selectedCustomerIdx].id);
                        $location.path('/');
                    } else {
                        $location.path('add-customer');
                    }
                    dialog.close();
                };

            });
}(angular));