(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').controller('MainCtrl', function($scope, $dialog, $location, DialogService) {

        $scope.openDialogAddToBasket = function(id) {
            DialogService.openDialogAddToBasket({
                id : id
            });
        };
        $scope.openDialogEditPass = DialogService.openDialogEditPass;
        $scope.openDialogChooseCustomer = DialogService.openDialogChooseCustomer;
        $scope.openDialogInputProducts = DialogService.openDialogInputProducts;

    });
}(angular));