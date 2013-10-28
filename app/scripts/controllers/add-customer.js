(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('AddCustomerCtrl', function($scope, $dialog, $location, DataProvider, DialogService) {

        // ############################################################################################################
        // Scope binding variables
        // ############################################################################################################

        $scope.dataProvider = DataProvider;

        $scope.failed = false;

        $scope.customer = {
            address : {},
            birthday : {},
            emails : [ {
                address : ''
            } ],
            phones : [ {
                number : ''
            } ]
        };
        var customer = $scope.customer;

        // ############################################################################################################
        // Scope functions
        // ############################################################################################################

        $scope.openDialogAddCustomerTels = function openDialogAddCustomerTels(phones) {
            DialogService.openDialogAddCustomerTels({
                phones : phones
            }, function resultPhones(phones) {
                customer.phones = phones;
            });
        };

        $scope.openDialogAddCustomerEmails = function openDialogAddCustomerEmails(emails) {
            DialogService.openDialogAddCustomerEmails({
                emails : emails
            }, function resultPhones(emails) {
                customer.emails = emails;
            });
        };

        $scope.confirm = function confirm() {
            $scope.failed = true;
            if (!$scope.customerForm.$valid) {
                alert('Preencha os campos destacados.');
                return;
            }
            DataProvider.customers.push(customer);
            DataProvider.customers.sort(function(x, y) {
                return ((x.name == y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
            });
            $location.path('/');
        };

        $scope.goToBasket = function() {
            $location.path('basket');
        };
    });
}(angular));