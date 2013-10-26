(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('AddCustomerCtrl', function($scope, $dialog, $location, DataProvider) {

        $scope.dataProvider = DataProvider;
        $scope.failed = false;

        $scope.customer = {
            address : {},
            birthday : {},
            emails : [],
            phones : []
        };

        $scope.confirm = function confirm() {
            console.log($scope.customerForm);
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
                var firstRequired = $scope.customerForm.$error.required[0];
                alert('Preencha os campos destacados.');
                return;
            }
            DataProvider.customers.push($scope.customer);
            DataProvider.customers.sort(function(x, y) {
                return ((x.name == y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
            });
            $location.path('/');
        };

        $scope.openDialogAddCustomerTels = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.phone = $scope.customer.phone;
            delete $scope.customer.phone;
            d.phones = $scope.customer.phones;
            d.open('views/parts/add-customer/add-customer-tels-dialog.html', 'AddCustomerTelsDialogCtrl').then(function(value) {
                $scope.customer.phones = value;
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
        $scope.goToBasket = function() {
            $location.path('basket');
        };
        $scope.openDialogChooseCustomer = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.open('views/parts/global/choose-customer-dialog.html', 'ChooseCustomerDialogCtrl');
        };
    });
}(angular));