(function(angular) {
    'use strict';
    angular.module('tnt.catalog.service.dialog',['ui.bootstrap']).service('DialogService', ['$q','$dialog', function($q, $dialog) {

        /**
         * Generic function to open a dialog.
         * 
         * @param template - path to a html template.
         * @param controller - name of the controller to be used by the dialog.
         * @param data - data to be passed on to the dialog.
         * @param callback - callback function to be executed when the dialog
         *            closes.
         * @param parentDialog - A dialog this dialog being opened is attached to,
         *            meaning it should be closed if the parent dialog closes.
         * 
         */
        var openDialog = function openDialog(template, controller, data, cssClass, parentDialog) {
            var d = $dialog.dialog({
                backdrop : !parentDialog,
                backdropClick : true,
                dialogClass : cssClass
            });

            d.data = data;
            d.parentDialog = parentDialog;

            function closeDialog() {
                d.$scope.cancel();
            }

            if (parentDialog) {
                // If the parent dialog's promise is ended somehow (resolved
                // or rejected), close the child dialog.
                parentDialog.deferred.promise.then(closeDialog, closeDialog);
            }

            return d.open(template, controller);
        };

        this.openDialog = openDialog;


        var cssDefaultClass = 'modal';

        /**
         * Message dialog that returns a promise and if the dialog is not closed
         * by the cancel button return a rejected promise.
         * 
         * @param {object} data - Object to be passed to the dialog.
         * @returns {object} safeDialog - Dialog promise with safe exit.
         */
        this.messageDialog = function(data) {
            var dialogPromise =
                    openDialog(
                            'views/parts/global/message-dialog.html', 'MessageDialogCtrl', data,
                            cssDefaultClass);
            var safeDialog = dialogPromise.then(function(success) {
                var result = null;
                if(success){
                    result = success;
                } else {
                    result = $q.reject('canceledByUser');
                }
                return result;
            });
            
            return safeDialog;
        };

        this.openDialogNumpad = function(data, parent) {
            return openDialog('views/parts/global/numpad-dialog.html', 'NumpadDialogCtrl', data, 'modal-numpad', parent);
        };

        this.openDialogAddCustomerTels = function(data) {
            return openDialog('views/parts/add-customer/add-customer-phones-dialog.html', 'AddCustomerPhonesDialogCtrl', data, 'modal-add-customer-tel');
        };

        this.openDialogAddCustomerEmails = function(data) {
            return openDialog('views/parts/add-customer/add-customer-emails-dialog.html', 'AddCustomerEmailsDialogCtrl', data, 'modal-add-customer-email');
        };

        this.openDialogAddToBasket = function(data) {
            return openDialog('views/parts/catalog/add-to-basket-dialog.html', 'AddToBasketDialogCtrl', data, 'modal-add-basket-dialog');
        };
        
        this.openDialogAddToBasketDetails = function(data) {
            return openDialog('views/parts/catalog/add-to-basket-dialog-details.html', 'AddToBasketDialogCtrl', data, 'modal-add-basket-details-dialog');
        };

        this.openDialogChangePass = function(data) {
            return openDialog('views/parts/global/change-pass-dialog.html', 'ChangePassDialogCtrl', data, cssDefaultClass);
        };

        this.openDialogChooseCustomer = function(data) {
            return openDialog('views/parts/global/choose-customer-dialog.html', 'ChooseCustomerDialogCtrl', data, 'modal-choose-customer-dialog');
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
            return openDialog('views/parts/products-to-buy/products-to-buy-ticket-dialog.html', 'ProductsToBuyTicketDialogCtrl', data, 'modal-products-to-buy-ticket');
        };

        this.openDialogReceivable = function(data) {
            return openDialog('views/parts/receivable/receivable-dialog.html', '', data, 'modal-receivable');
        };
    }]);

}(angular));
