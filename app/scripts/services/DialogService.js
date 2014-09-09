(function (angular) {
    'use strict';
    angular.module('tnt.catalog.service.dialog', ['ui.bootstrap']).service('DialogService', ['$q', '$dialog', function ($q, $dialog) {


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

        var openSubscriptionDialog = function openSubscriptionDialog(template, controller, data, cssClass) {

            var options = {
                backdrop: 'static',
                backdropClick: false,
                dialogClass: cssClass,
                keyboard: false
            };

            var dialog = _openDialog(data, options);

            function closeDialog() {
                dialog.$scope.cancel();
            }

            return dialog.open(template, controller);
        };

        this.openSubscriptionDialog = openSubscriptionDialog;

        var openDialog = function openDialog(template, controller, data, cssClass, parentDialog) {
            var options = {
                backdrop: !parentDialog,
                backdropClick: true,
                dialogClass: cssClass
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
        this.messageDialog = function (data) {
            var dialogPromise =
                openDialog(
                    'views/parts/global/sacred-message-dialog.html', 'MessageDialogCtrl', data,
                    cssSmallClass);
            var safeDialog = dialogPromise.then(function (success) {
                var result = null;
                if (success) {
                    result = success;
                } else {
                    result = $q.reject('canceledByUser');
                }
                return result;
            });

            return safeDialog;
        };

        this.openDialogNumpad = function (data, parent) {
            return openDialog('views/parts/global/numpad-dialog.html', 'NumpadDialogCtrl', data, 'modal-numpad', parent);
        };

        this.openDialogAddCustomerTels = function (data) {
            return openDialog('views/parts/add-customer/add-customer-phones-dialog.html', 'AddCustomerPhonesDialogCtrl', data, 'modal-add-customer-tel');
        };

        this.openDialogAddCustomerEmails = function (data) {
            return openDialog('views/parts/add-customer/add-customer-emails-dialog.html', 'AddCustomerEmailsDialogCtrl', data, 'modal-add-customer-email');
        };

        this.openDialogAddToBasket = function (data) {
            return openDialog('views/parts/catalog/add-to-basket-dialog.html', 'AddToBasketDialogCtrl', data, 'modal-add-basket-dialog');
        };

        this.openDialogAddToBasketSku = function (data) {
            return openDialog('views/parts/catalog/add-to-basket-dialog-sku.html', 'AddToBasketDialogCtrl', data, 'modal-add-basket-payment-dialog');
        };

        this.openDialogAddToBasketDetails = function (data) {
            return openDialog('views/parts/catalog/add-to-basket-dialog-details.html', 'AddToBasketDialogCtrl', data, 'modal-add-basket-details-dialog');
        };

        this.openDialogChangePass = function (data) {
            return openDialog('views/parts/global/sacred-change-pass-dialog.html', 'ChangePassDialogCtrl', data, cssSmallClass);
        };

        this.openDialogChooseCustomer = function (data) {
            return openDialog('views/parts/global/sacred-choose-customer-dialog.html', 'ChooseCustomerDialogCtrl', data, 'modal-choose-customer-dialog');
        };

        this.openDialogChooseCustomerNoRedirect = function (data) {
            return openDialog('views/parts/global/sacred-choose-customer-dialog.html', 'ChooseCustomerDialogNoRedirectCtrl', data, 'modal-choose-customer-dialog');
        };

        this.openDialogDeliveryDetails = function (data) {
            return openDialog('views/parts/partial-delivery/delivery-details-dialog.html', 'DeliveryDetailsDialogCtrl', data, cssDefaultClass);
        };

        /* FIX-ME this shold be removed! */
        this.openDialogCustomerInfo = function (data) {
            return openDialog('views/parts/partial-delivery/customer-info-dialog.html', 'CustomerInfoDialogCtrl', data, cssDefaultClass);
        };

        this.openDialogPurchaseOrderTicket = function (data) {
            return openDialog('views/parts/purchase-order/sacred-purchase-order-ticket-dialog.html', 'PurchaseOrderTicketDialogCtrl', data, 'modal-products-to-buy-ticket');
        };

        this.openDialogReceivable = function (data) {
            return openDialog('views/parts/receivable/receivable-dialog.html', 'ReceivableConfigureLiquidateCtrl', data, 'modal-receivable');
        };

        this.openDialogDeliveryScheduler = function (data) {
            return openDialog('views/parts/products-delivery/sacred-products-delivery-to-be-delivery-schedule-dialog.html', 'ScheduleDeliveryCtrl', data, 'modal-products-delivery');
        };

        this.openDialogSubscriptionAdditionalInformation = function (data) {
            return openSubscriptionDialog('views/parts/subscription/subscription-additional-information-dialog.html', 'SubscriptionCtrl', data, 'modal-subscription-additional-information-dialog');
        };

        this.openDialogSubscriptionLastPlanNull = function (data) {
            return openSubscriptionDialog('views/parts/subscription/subscription-lastPlanNull-dialog.html', 'SubscriptionCtrl', data, 'modal-subscription-last-plan-dialog');
        };

        this.openDialogSubscriptionLastPlanGloss = function (data) {
            return openSubscriptionDialog('views/parts/subscription/subscription-lastPlanGloss-dialog.html', 'SubscriptionCtrl', data, 'modal-subscription-last-plan-dialog');
        };

        this.openDialogSubscriptionLastPlanBlush = function (data) {
            return openSubscriptionDialog('views/parts/subscription/subscription-lastPlanBlush-dialog.html', 'SubscriptionCtrl', data, 'modal-subscription-last-plan-dialog');
        };

        this.openDialogSubscriptionLastPlanRimel = function (data) {
            return openSubscriptionDialog('views/parts/subscription/subscription-lastPlanRimel-dialog.html', 'SubscriptionCtrl', data, 'modal-subscription-last-plan-dialog');
        };

        this.openDialogSubscriptionFinalMessageBillet = function (data) {
            return openSubscriptionDialog('views/parts/subscription/subscription-final-message-billet-dialog.html', 'SubscriptionCtrl', data, 'modal-subscription-final-message-dialog');
        };

        this.openDialogSubscriptionFinalMessageCC = function (data) {
            return openSubscriptionDialog('views/parts/subscription/subscription-final-message-cc-dialog.html', 'SubscriptionCtrl', data, 'modal-subscription-final-message-dialog');
        };

        this.openDialogLoading = function (data) {
            var options = {
                backdrop: true,
                backdropClick: false,
                dialogClass: cssSmallClass
            };

            var dialog = _openDialog(data, options);

            dialog.open('views/parts/global/loading-dialog.html', 'LoadingDialogCtrl');

            return dialog;
        };

        this.openImageUploadDialog = function (data) {
            return openDialog('views/parts/global/image-upload-dialog.html', 'ImageUploadCtrl', data, cssDefaultClass);
        };

        this.openGoalPosterEditDialog = function (data) {
            return openDialog('views/parts/goal-poster/sacred-goal-poster-edit-dialog.html', 'GoalPosterEditDialogCtrl', data, 'modal-goal-poster-edit');
        };
    }]);

}(angular));
