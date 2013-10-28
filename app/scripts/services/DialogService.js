(function(angular) {
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
        this.openDialog = function openDialog(template, controller, data, callback) {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.data = data;
            d.open(template, controller).then(callback);
        };
        var openDialog = this.openDialog;

        this.openDialogAddCustomerTels = function(data, callback) {
            openDialog('views/parts/add-customer/add-customer-tels-dialog.html', 'AddCustomerTelsDialogCtrl', data, callback);
        };

        this.openDialogAddCustomerEmails = function(data, callback) {
            openDialog('views/parts/add-customer/add-customer-emails-dialog.html', 'AddCustomerEmailsDialogCtrl', data, callback);
        };

        this.openDialogAddToBasket = function(data, callback) {
            openDialog('views/parts/catalog/add-to-basket-dialog.html', 'AddToBasketDialogCtrl', data, callback);
        };

        this.openDialogEditPass = function(data, callback) {
            openDialog('views/parts/add-customer/edit-pass-dialog.html', 'EditPassDialogCtrl', data, callback);
        };

        this.openDialogChooseCustomer = function(data, callback) {
            openDialog('views/parts/global/choose-customer-dialog.html', 'ChooseCustomerDialogCtrl', data, callback);
        };

        this.openDialogEditPass = function(data, callback) {
            openDialog('views/parts/global/edit-pass-dialog.html', 'EditPassDialogCtrl', data, callback);
        };

        this.openDialogInputProducts = function(data, callback) {
            openDialog('views/parts/global/input-products-dialog.html', 'InputProductsCtrl', data, callback);
        };

        this.openDialogAdvanceMoney = function(data, callback) {
            openDialog('views/parts/payment/payment-advance-money-dialog.html', 'PaymentAdvanceMoneyDialogCtrl', data, callback);
        };

        this.openDialogProductExchange = function(data, callback) {
            openDialog('views/parts/payment/payment-product-exchange-dialog.html', 'PaymentProductExchangeDialogCtrl', data, callback);
        };

        this.openDialogCheck = function(data, callback) {
            openDialog('views/parts/payment/payment-check-dialog.html', 'PaymentCheckDialogCtrl', data, callback);
        };

        this.openDialogCreditCard = function(data, callback) {
            openDialog('views/parts/payment/payment-credit-card-dialog.html', 'PaymentCreditCardDialogCtrl', data, callback);
        };
    });

}(angular));