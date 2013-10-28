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

        // ############################################################################################################
        // add-customer
        // ############################################################################################################

        this.openDialogAddCustomerTels = function(data, callback) {
            this.openDialog('views/parts/add-customer/add-customer-tels-dialog.html', 'AddCustomerTelsDialogCtrl', data, callback);
        };
        this.openDialogAddCustomerEmails = function(data, callback) {
            this.openDialog('views/parts/add-customer/add-customer-emails-dialog.html', 'AddCustomerEmailsDialogCtrl', data, callback);
        };
        this.openDialogEditPass = function(data, callback) {
            this.openDialog('views/parts/add-customer/edit-pass-dialog.html', 'EditPassDialogCtrl', data, callback);
        };
        this.openDialogChooseCustomer = function(data, callback) {
            this.openDialog('views/parts/global/choose-customer-dialog.html', 'ChooseCustomerDialogCtrl', data, callback);
        };

    });
}(angular));