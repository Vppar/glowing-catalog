(function(angular) {
    'use strict';
    angular.module('tnt.catalog.service.dialog',['ui.bootstrap']).service('DialogService', ['$dialog', function($dialog) {

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
        var openDialog = function openDialog(template, controller, data, cssClass) {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : cssClass
            });
            d.data = data;
            return d.open(template, controller);
        };
        this.openDialog = openDialog;

        var cssDefaultClass = 'modal';

        this.messageDialog = function(data) {
            return openDialog('views/parts/global/message-dialog.html', 'MessageDialogCtrl', data, cssDefaultClass);
        };

        this.openDialogNumpad = function(data) {
            return openDialog('views/parts/global/numpad-dialog.html', 'NumpadDialogCtrl', data, 'modal-numpad');
        };

        this.openDialogAddCustomerTels = function(data) {
            return openDialog('views/parts/add-customer/add-customer-phones-dialog.html', 'AddCustomerPhonesDialogCtrl', data, cssDefaultClass);
        };

        this.openDialogAddCustomerEmails = function(data) {
            return openDialog('views/parts/add-customer/add-customer-emails-dialog.html', 'AddCustomerEmailsDialogCtrl', data, cssDefaultClass);
        };

        this.openDialogAddToBasket = function(data) {
            // at new layout, the last attr should be 'modal-add-basket-dialog'
            return openDialog('views/parts/catalog/add-to-basket-dialog.html', 'AddToBasketDialogCtrl', data, cssDefaultClass);
        };
        
        this.openDialogAddToBasketDetails = function(data) {
            // at new layout, the last attr should be 'modal-add-basket-details-dialog'
            return openDialog('views/parts/catalog/add-to-basket-dialog-details.html', 'AddToBasketDialogCtrl', data, cssDefaultClass);
        };

        this.openDialogChangePass = function(data) {
            return openDialog('views/parts/global/change-pass-dialog.html', 'ChangePassDialogCtrl', data, cssDefaultClass);
        };

        this.openDialogChooseCustomer = function(data) {
            return openDialog('views/parts/global/choose-customer-dialog.html', 'ChooseCustomerDialogCtrl', data, cssDefaultClass);
        };

        this.openDialogInputProducts = function(data) {
            return openDialog('views/parts/global/input-products-dialog.html', 'InputProductsCtrl', data, cssDefaultClass);
        };

        this.openDialogAdvanceMoney = function(data) {
            return openDialog('views/parts/payment/payment-advance-money-dialog.html', 'PaymentAdvanceMoneyDialogCtrl', data, cssDefaultClass);
        };

        this.openDialogProductExchange = function(data) {
            return openDialog('views/parts/payment/payment-product-exchange-dialog.html', 'PaymentProductExchangeDialogCtrl', data, cssDefaultClass);
        };

        this.openDialogCheck = function(data) {
            return openDialog('views/parts/payment/payment-check-dialog.html', 'PaymentCheckDialogCtrl', data, cssDefaultClass);
        };

        this.openDialogCreditCard = function(data) {
            return openDialog('views/parts/payment/payment-credit-card-dialog.html', 'PaymentCreditCardDialogCtrl', data, cssDefaultClass);
        };

        this.openDialogDeliveryDetails = function(data) {
            return openDialog('views/parts/partial-delivery/delivery-details-dialog.html', 'DeliveryDetailsDialogCtrl', data, cssDefaultClass);
        };

        this.openDialogCustomerInfo = function(data) {
            return openDialog('views/parts/partial-delivery/customer-info-dialog.html', 'CustomerInfoDialogCtrl', data, cssDefaultClass);
        };
        
        this.openDialogProductsToBuyConfirm = function(data) {
            return openDialog('views/parts/products-to-buy/products-to-buy-confirm-dialog.html', 'ProductsToBuyConfirmDialogCtrl', data, cssDefaultClass);
        };
        
        this.openDialogProductsToBuyTicket = function(data) {
            return openDialog('views/parts/products-to-buy/products-to-buy-ticket-dialog.html', 'ProductsToBuyTicketDialogCtrl', data, cssDefaultClass);
        };
    }]);

}(angular));
