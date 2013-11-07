(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('HeaderCtrl', function($scope, $filter, $location, OrderService, DialogService) {

        // #############################################################################################################
        // Scope variables from services
        // #############################################################################################################
        /**
         * Expose basket in the scope.
         */
        $scope.basket = OrderService.getBasket();

        // #############################################################################################################
        // Dialogs control
        // #############################################################################################################
        /**
         * Opens the dialog to change the password.
         */
        $scope.openDialogChangePass = DialogService.openDialogChangePass;
        /**
         * Opens the dialog to choose a customer.
         */
        $scope.openDialogChooseCustomer = DialogService.openDialogChooseCustomer;
        /**
         * Opens the dialog to choose a customer.
         */
        $scope.openDialogInputProducts = DialogService.openDialogInputProducts;

        // #############################################################################################################
        // Flow control functions
        // #############################################################################################################
        /**
         * Redirect to the basket.
         */
        $scope.goToBasket = function() {
            $location.path('/basket');
        };

    });
}(angular));
