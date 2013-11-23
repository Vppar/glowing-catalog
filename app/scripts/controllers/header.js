(function(angular) {
    'use strict';

    angular.module('tnt.catalog.header',[]).controller('HeaderCtrl', function($scope, $filter, $location, OrderService, DialogService) {

        // #############################################################################################################
        // Scope variables from services
        // #############################################################################################################
        /**
         * Expose basket in the scope.
         */
        $scope.order = OrderService.order;

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
         * Opens the dialog to input a product.
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
