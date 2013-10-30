(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').service('DialogService', function($dialog) {

        /**
         * Generic function to open a dialog.
         * 
         * @param template - path to a html template.
         * @param controller - name of the controller to be used by the dialog.
         * @param data - data to be passed on to the dialog.
         * @param callback - callback function to be executed when the dialog
         *            closes.
         * 
         */
        var openDialog = function openDialog(template, controller, data) {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.data = data;
            return d.open(template, controller);
        };
        this.openDialog = openDialog;

        this.confirmationDialog = function(data) {
            return openDialog('views/parts/payment/confirmation-dialog.html', 'ConfirmationDialogCtrl', data);
        };

        this.openDialogAddCustomerTels = function(data) {
            return openDialog('views/parts/add-customer/add-customer-tels-dialog.html', 'AddCustomerTelsDialogCtrl', data);
        };

        this.openDialogAddCustomerEmails = function(data) {
            return openDialog('views/parts/add-customer/add-customer-emails-dialog.html', 'AddCustomerEmailsDialogCtrl', data);
        };

        this.openDialogAddToBasket = function(data) {
            return openDialog('views/parts/catalog/add-to-basket-dialog.html', 'AddToBasketDialogCtrl', data);
        };

        this.openDialogEditPass = function(data) {
            return openDialog('views/parts/add-customer/edit-pass-dialog.html', 'EditPassDialogCtrl', data);
        };

        this.openDialogChooseCustomer = function(data) {
            return openDialog('views/parts/global/choose-customer-dialog.html', 'ChooseCustomerDialogCtrl', data);
        };

        this.openDialogEditPass = function(data) {
            return openDialog('views/parts/global/edit-pass-dialog.html', 'EditPassDialogCtrl', data);
        };

        this.openDialogInputProducts = function(data) {
            return openDialog('views/parts/global/input-products-dialog.html', 'InputProductsCtrl', data);
        };

        this.openDialogAdvanceMoney = function(data) {
            return openDialog('views/parts/payment/payment-advance-money-dialog.html', 'PaymentAdvanceMoneyDialogCtrl', data);
        };

        this.openDialogProductExchange = function(data) {
            return openDialog('views/parts/payment/payment-product-exchange-dialog.html', 'PaymentProductExchangeDialogCtrl', data);
        };

        this.openDialogCheck = function(data) {
            return openDialog('views/parts/payment/payment-check-dialog.html', 'PaymentCheckDialogCtrl', data);
        };

        this.openDialogCreditCard = function(data) {
            return openDialog('views/parts/payment/payment-credit-card-dialog.html', 'PaymentCreditCardDialogCtrl', data);
        };

        this.openDialogDeliveryDetails = function(data) {
            return openDialog('views/parts/partial-delivery/delivery-details-dialog.html', 'DeliveryDetailsDialogCtrl', data);
        };

        this.openDialogCustomerInfo = function(data) {
            return openDialog('views/parts/partial-delivery/customer-info-dialog.html', 'CustomerInfoDialogCtrl', data);
        };
    });

}(angular));