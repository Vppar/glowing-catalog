(function(angular) {
    'use strict';
    angular.module('tnt.catalog.service.dialog',['ui.bootstrap']).service('DialogService', ['$q','$dialog', function($q, $dialog) {

        
        // I needed a more flexible `openDialog` function but did'n wanted to change the
        // signature of the currently used one. Therefore I'm creating this underscored
        // function.
        function _openDialog(data, options) {
            options = options || {};

            var dialog = $dialog.dialog(options);
            dialog.data = data;

            function closeDialog() {
                dialog.$scope.cancel();
            }

            return dialog;
        }


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
            var options = {
              backdrop : !parentDialog,
              backdropClick : true,
              dialogClass : cssClass
            };

            var dialog = _openDialog(data, options);
            dialog.parentDialog = parentDialog;
            
            function closeDialog() {
                dialog.$scope.cancel();
            }

            if (parentDialog) {
                // If the parent dialog's promise is ended somehow (resolved
                // or rejected), close the child dialog.
                parentDialog.deferred.promise.then(closeDialog, closeDialog);
            }

            return dialog.open(template, controller);
        };

        this.openDialog = openDialog;


        var cssDefaultClass = 'modal';
        var cssSmallClass = 'modal-small';

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
                            'views/parts/global/sacred-message-dialog.html', 'MessageDialogCtrl', data,
                            cssSmallClass);
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

        this.openDialogAddToBasketSku = function(data) {
            return openDialog('views/parts/catalog/add-to-basket-dialog-sku.html', 'AddToBasketDialogCtrl', data, 'modal-add-basket-payment-dialog');
        };
        
        this.openDialogAddToBasketDetails = function(data) {
            return openDialog('views/parts/catalog/add-to-basket-dialog-details.html', 'AddToBasketDialogCtrl', data, 'modal-add-basket-details-dialog');
        };

        this.openDialogChangePass = function(data) {
            return openDialog('views/parts/global/sacred-change-pass-dialog.html', 'ChangePassDialogCtrl', data, cssSmallClass);
        };

        this.openDialogChooseCustomer = function(data) {
            return openDialog('views/parts/global/sacred-choose-customer-dialog.html', 'ChooseCustomerDialogCtrl', data, 'modal-choose-customer-dialog');
        };

        this.openDialogChooseCustomerNoRedirect = function(data) {
            return openDialog('views/parts/global/sacred-choose-customer-dialog.html', 'ChooseCustomerDialogNoRedirectCtrl', data, 'modal-choose-customer-dialog');
        };

        this.openDialogDeliveryDetails = function(data) {
            return openDialog('views/parts/partial-delivery/delivery-details-dialog.html', 'DeliveryDetailsDialogCtrl', data, cssDefaultClass);
        };

        /* FIX-ME this shold be removed! */
        this.openDialogCustomerInfo = function(data) {
            return openDialog('views/parts/partial-delivery/customer-info-dialog.html', 'CustomerInfoDialogCtrl', data, cssDefaultClass);
        };
        
        this.openDialogPurchaseOrderTicket = function(data) {
            return openDialog('views/parts/purchase-order/sacred-purchase-order-ticket-dialog.html', 'PurchaseOrderTicketDialogCtrl', data, 'modal-products-to-buy-ticket');
        };

        this.openDialogReceivable = function(data) {
            return openDialog('views/parts/receivable/receivable-dialog.html', 'ReceivableConfigureLiquidateCtrl', data, 'modal-receivable');
        };
        
        this.openDialogDeliveryScheduler = function(data) {
            return openDialog('views/parts/products-delivery/sacred-products-delivery-to-be-delivery-schedule-dialog.html', 'ScheduleDeliveryCtrl', data, 'modal-products-delivery');
        };

        this.openDialogLoading = function (data) {
            var options = {
                backdrop : true,
                backdropClick : false,
                dialogClass : cssSmallClass
            };

            var dialog = _openDialog(data, options);

            dialog.open('views/parts/global/loading-dialog.html', 'LoadingDialogCtrl');

            return dialog;
        };
    }]);

}(angular));
