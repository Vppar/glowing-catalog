(function(angular) {
    'use strict';

    angular.module('tnt.catalog.header', ['tnt.catalog.service.data']).controller('HeaderCtrl', function($scope, $filter, $location, $timeout, OrderService, DialogService, DataProvider) {

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

        $scope.now = {};

        // #############################################################################################################
        // Flow control functions
        // #############################################################################################################
        /**
         * Redirect to payment if products and customer were selected.
         */
        $scope.checkout = function(bypassBasket) {
            var basket = $filter('filter')(order.items, inBasketFilter);
            if ((basket && basket.length > 0) || bypassBasket) {
                if (order.customerId) {
                    $location.path('/payment');
                } else {
                    DialogService.openDialogChooseCustomer();
                }
                if (OrderService.order.id === undefined) {
                    OrderService.createNew();
                }
            } else {
                DialogService.messageDialog({
                    title : 'Pagamento',
                    message : 'Nenhum produto selecionado.',
                    btnYes : 'OK'
                });
            }
        };

        function refreshDate() {
            $scope.now.date = $filter('date')(new Date(), 'dd MMM yyyy');
            $scope.now.time = $filter('date')(new Date(), 'HH:mm');
            $timeout(refreshDate, 10000);
        }
        refreshDate();


        // ###################################
        // Development functions
        // ###################################
        // TODO: remove this from production
        //
        var
          gopay = DataProvider.gopay,
          envFlags = DataProvider.envFlags;

        $scope.gopay = gopay;
        $scope.envFlags = envFlags;

        /**
         * Toggles the 'merchant' attribute in the scope.
         */
        var _originalMerchant; // holds merchant's original value
        $scope.toggleMerchant = function () {
            if (gopay.merchant) { _originalMerchant = gopay.merchant; }
            gopay.merchant = gopay.merchant ? false : _originalMerchant;
        };

        /**
         * Toggles the 'internet' attribte in the scope.
         */
        $scope.toggleInternetConnectivity = function () {
          envFlags.internet = !envFlags.internet;
        };
    });
}(angular));
