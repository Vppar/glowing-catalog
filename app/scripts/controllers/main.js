(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').controller('MainCtrl', function($scope, $dialog, $location, OrderService, DialogService) {

        // #############################################################################################################
        // Dialogs control
        // #############################################################################################################
        /**
         * Opens the dialog to add a product to the basket and in the promise
         * resolution add it to the basket ... or do nothing.
         */
        $scope.openDialogAddToBasket = function(id) {
            
            if (OrderService.order.id === undefined) {
                OrderService.createOrder();
            }
            
            var addToBasketPromise = DialogService.openDialogAddToBasket({
                id : id
            });
            addToBasketPromise.then(function() {
                if (!OrderService.order.customerId) {
                    DialogService.openDialogChooseCustomer();
                }
            });
        };
        
    });
}(angular));