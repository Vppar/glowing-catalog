(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.oncuff.ctrl', [
        'tnt.catalog.service.dialog', 'tnt.catalog.order.service', 'tnt.catalog.payment.oncuff.service', 'tnt.catalog.misplaced.service'
    ]).controller('PaymentOnCuffCtrl',

    /**
     * Controller to handle payment-left-on-cuff screen.
     * 
     * @param {Object} $scope - Angular execution context.
     * @param {function} $filter - Angular filter service.
     * @param {function} $log - Angular log service.
     * @param {DialogService} DialogService - Handles all dialog message box.
     * @param {OnCuffPaymentService} OnCuffPaymentService - Handles the business
     *            logic of this controller.
     * @param {Misplacedservice} Misplacedservice - Generate installments to
     *            general payments.
     */
    function PaymentOnCuffCtrl($scope, $filter, $log, DialogService, OrderService, OnCuffPaymentService, Misplacedservice) {

        // Block undesired access.
        shouldOpenOnCuff(DialogService, $scope.total.change);

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
        var paymentChange = $scope.total.change;

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
        function shouldOpenOnCuff(dialogService, paymentChange) {
            if (paymentChange >= 0) {
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

        // #####################################################################################################
        // Scope variables
        // #####################################################################################################

        /** @type {Object} - Declaring onCuff reference object. */
        $scope.onCuff = OnCuffPaymentService.buildOnCuffRef(paymentChange, order);

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
            onCuff.installments = Misplacedservice.recalc(onCuff.amount, index, onCuff.installments, 'amount');
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
         * Every amount change, will update all onCuff installments.
         */
        $scope.$watch('onCuff.amount', function(newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.onCuff.installments = OnCuffPaymentService.buildInstallments($scope.onCuff);
            }

        });

        /**
         * OnCuff reference watchers.
         * 
         * Every duedate will update all onCuff installments.
         */
        $scope.$watch('onCuff.dueDate', function(newVal, oldVal) {
            // Test newVal to see if it is a valid date.
            if (newVal && angular.isDate(newVal) && newVal !== oldVal) {
                $scope.onCuff.installments = OnCuffPaymentService.buildInstallments($scope.onCuff);
            }
        });
    });
}(angular));
