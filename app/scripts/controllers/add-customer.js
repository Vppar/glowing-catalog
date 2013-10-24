(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('AddCustomerCtrl', function($scope, $dialog, $location, DataProvider) {

        $scope.dataProvider = DataProvider;

        $scope.customer = {
            address : {},
            emails : [],
            phones : []
        };

        $scope.confirm = function confirm() {
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
            delete  $scope.customer.email;
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