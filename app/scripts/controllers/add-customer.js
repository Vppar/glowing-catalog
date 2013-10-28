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
            emails : [],
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
            }, function recoverPhones(phones) {
                customer.phones = phones;
            });
        };

        $scope.openDialogAddCustomerEmails = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.email = $scope.customer.email;
            delete $scope.customer.email;
            d.emails = $scope.customer.emails;
            d.open('views/parts/add-customer/add-customer-emails-dialog.html', 'AddCustomerEmailsDialogCtrl').then(function(value) {
                $scope.customer.emails = value;
            });
        };
        $scope.openDialogEditPass = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.open('views/parts/add-customer/edit-pass-dialog.html', 'EditPassDialogCtrl');
        };
        $scope.openDialogChooseCustomer = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.open('views/parts/global/choose-customer-dialog.html', 'ChooseCustomerDialogCtrl');
        };

        $scope.confirm = function confirm() {
            $scope.failed = true;
            if ($scope.customer.emails.length) {
                alert('É necessário cadastrar pelo menos 1 e-mail para criar o novo cliente.');
                return;
            }
            if ($scope.customer.phones.length) {
                alert('É necessário cadastrar pelo menos 1 telefone para criar o novo cliente.');
                return;
            }
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