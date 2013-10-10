(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('BasketCtrl', function($scope, $dialog, DataProvider) {

        $scope.dataProvider = DataProvider;

        $scope.remove = function remove(index) {
            $scope.dataProvider.products.splice(index, 1);
        };

        $scope.openDialogEditPass = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.open('views/edit-pass-dialog.html', 'EditPassDialogCtrl');
        };
        $scope.openDialogChooseCustomer = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.open('views/choose-customer-dialog.html', 'ChooseCustomerDialogCtrl');
        };
    });
}(angular));