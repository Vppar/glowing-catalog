(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.oncuff.ctrl', [
        'tnt.catalog.service.dialog', 'tnt.catalog.order.service', 'tnt.catalog.payment.oncuff.service', 'tnt.catalog.misplaced.service'
    ]).controller('PaymentOnCuffCtrl',

    /**
     * Controller to handle payment-left-on-cuff screen.
     * 
     * @param {Object} $scope - Angular execution context.
     * @param {OrderService} OrderService - Handles sale orders operations.
     * @param {DialogService} DialogService - Handles all dialog message box.
     * @param {OnCuffPaymentService} OnCuffPaymentService - Handles the business
     *            logic of this controller.
     */
    function PaymentOnCuffCtrl($scope, DialogService, OrderService, OnCuffPaymentService) {

        // Block undesired access.
        shouldOpen(DialogService, $scope.total.change);

        // #####################################################################################################
        // Local variables
        // #####################################################################################################

        /** @type {Date} TODAY - Reference date. */
        var TODAY = new Date();
        TODAY.setHours(0);
        TODAY.setMinutes(0);
        TODAY.setSeconds(0);

        /** @type {Object} - Provide easier access to the sale order entity. */
        var order = angular.copy(OrderService.order);
        /**
         * @type {function} - Inherited selectPaymentMethod function from parent
         *       scope.
         */
        var selectPaymentMethod = $scope.selectPaymentMethod;
        /** @type {function} - Inherited change amount. */
        var orderRemaining = -$scope.total.change;

        // #####################################################################################################
        // Local functions
        // #####################################################################################################

        /**
         * Test if there is any amount left of the order, if there is allow
         * entrance, if not, send a warning dialog and kick the user out.
         * 
         * @param {DialogService} - Service that handle dialogs.
         * @param {number} - Order change amount
         */
        function shouldOpen(dialogService, paymentChange) {
            if (paymentChange > 0) {
                var dialogData = {
                    title : 'Contas a receber',
                    message : 'Não há saldo a receber neste pedido de venda.',
                    btnYes : 'OK'
                };
                dialogService.messageDialog(dialogData).then(function() {
                    selectPaymentMethod('none');
                });
            }
        }
        this.shouldOpen = shouldOpen;

        // #####################################################################################################
        // Scope variables
        // #####################################################################################################

        /** @type {Object} - Declaring onCuff reference object. */
        $scope.onCuff = OnCuffPaymentService.buildOnCuffRef(orderRemaining, order.customerId);

        /**
         * @type {Object} - Date to be used by datepicker as minimum date
         *       allowed.
         */
        $scope.TODAY = angular.copy(TODAY);

        // #####################################################################################################
        // Scope functions
        // #####################################################################################################

        /**
         * Recalculate installments amount on change.
         * 
         * @param index - Index of changed installment amount.
         */
        $scope.recalcInstallments = function recalcInstallments(index) {
            var onCuff = $scope.onCuff;
            onCuff.installments = OnCuffPaymentService.recalInstallments(index, onCuff);
        };

        /**
         * Register on PaymentService temporary storage the onCuff payments and
         * go home.
         */
        $scope.confirmOnCuffPayment = function confirmOnCuffPayment() {
            var installments = $scope.onCuff.installments;

            OnCuffPaymentService.registerInstallments(installments);

            selectPaymentMethod('none');
        };

        // #####################################################################################################
        // Watchers
        // #####################################################################################################

        /**
         * OnCuff reference watchers.
         * 
         * Every number of installments change, will update all onCuff installments.
         */
        $scope.$watch('onCuff.numberOfInstallments', function(newVal, oldVal) {
            if (newVal !== oldVal) {
                var onCuff = $scope.onCuff;

                var numberOfInstallments = onCuff.numberOfInstallments;
                var firstDueDateTime = onCuff.duedate.getTime();
                var amount = onCuff.amount;

                $scope.onCuff.installments = OnCuffPaymentService.buildInstallments(numberOfInstallments, firstDueDateTime, amount);
            }

        });

        /**
         * OnCuff reference watchers.
         * 
         * Every duedate will update all onCuff installments.
         */
        $scope.$watch('onCuff.duedate', function(newVal, oldVal) {
            // Test newVal to see if it is a valid date.
            if (newVal && angular.isDate(newVal) && newVal !== oldVal) {
                var onCuff = $scope.onCuff;

                var numberOfInstallments = onCuff.numberOfInstallments;
                var firstDueDateTime = onCuff.duedate.getTime();
                var amount = onCuff.amount;

                $scope.onCuff.installments = OnCuffPaymentService.buildInstallments(numberOfInstallments, firstDueDateTime, amount);
            }
        });
    });
}(angular));
