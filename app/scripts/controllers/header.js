(function(angular) {
    'use strict';

    angular.module('tnt.catalog.header', []).controller('HeaderCtrl', function($scope, $filter, $location, OrderService, DialogService) {

        // #############################################################################################################
        // Scope variables from services
        // #############################################################################################################
        /**
         * Expose basket in the scope.
         */
        var order = OrderService.order;
        $scope.order = order;

        var inBasketFilter = OrderService.inBasketFilter;

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
         * Redirect to payment if products and customer were selected.
         */
        $scope.checkout = function() {
            var basket = $filter('filter')(order.items, inBasketFilter);
            if (basket && basket.length > 0) {
                if (order.customerId) {
                    $location.path('/payment');
                } else {
                    DialogService.openDialogChooseCustomer();
                }
            } else {
                DialogService.messageDialog({
                    title : 'Pagamento',
                    message : 'Nenhum produto selecionado.',
                    btnYes : 'OK'
                });
            }

        };

    });
}(angular));
