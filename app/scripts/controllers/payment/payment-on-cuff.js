(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.oncuff.ctrl', [
        'tnt.catalog.service.dialog', 'tnt.catalog.order.service', 'tnt.catalog.payment.oncuff.service', 'tnt.catalog.misplaced.service'
    ]).controller('PaymentOnCuffCtrl', [
        '$scope', 'DialogService', 'OrderService', 'OnCuffPaymentService',
        /**
         * Controller to handle payment-left-on-cuff screen.
         * 
         * @param {Object} $scope - Angular execution context.
         * @param {OrderService} OrderService - Handles sale orders operations.
         * @param {DialogService} DialogService - Handles all dialog message
         *            box.
         * @param {OnCuffPaymentService} OnCuffPaymentService - Handles the
         *            business logic of this controller.
         */
        function PaymentOnCuffCtrl($scope, DialogService, OrderService, OnCuffPaymentService) {

            // #####################################################################################################
            // Local variables
            // #####################################################################################################

            /** @type {Date} TODAY - Reference date. */
            var TODAY = new Date();
            TODAY.setHours(0);
            TODAY.setMinutes(0);
            TODAY.setSeconds(0);

            /**
             * @type {Object} - Provide easier access to the sale order entity.
             */
            var order = angular.copy(OrderService.order);
            /**
             * @type {function} - Inherited selectPaymentMethod function from
             *       parent scope.
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
            this.shouldOpen = function shouldOpen(dialogService, paymentChange) {
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
            };

            /**
             * Build onCuff installments based on onCuff reference object by
             * calling OnCuffPaymentService.
             * 
             * @param {object} onCuff - OnCuff reference object.
             * @return {array} installments - OnCuff installments rebuided.
             */
            function buildInstallments(onCuff) {
                var numberOfInstallments = onCuff.numberOfInstallments;
                var firstDueDateTime = onCuff.duedate.getTime();
                var amount = onCuff.amount;

                return OnCuffPaymentService.buildInstallments(numberOfInstallments, firstDueDateTime, amount);
            }

            /**
             * Number of installments watcher callback. <br>
             * <br>
             * This method evaluate if the old and the new val are different and
             * then rebuild the installments.
             * 
             * @param {number} newVal - New number of installments.
             * @param {number} oldVal - Old number of installments.
             */
            function numberOfInstallmentsWatcherCallback(newVal, oldVal) {
                if (newVal !== oldVal) {
                    var onCuff = $scope.onCuff;
                    if(onCuff.numberOfInstallments > 12){
                        onCuff.numberOfInstallments = 12;
                    }
                    onCuff.installments = buildInstallments(onCuff);
                }
            }

            /**
             * Duedate watcher callback. <br>
             * <br>
             * This method evaluate if the old and the new val are different and
             * if the newVal is a valid date then rebuild the installments.
             * 
             * @param {date} newVal - New duedate.
             * @param {date} oldVal - Old duedate.
             */
            function duedateWatcherCallback(newVal, oldVal) {
                // Test newVal to see if it is a valid date.
                if (newVal && angular.isDate(newVal) && newVal !== oldVal) {
                    var onCuff = $scope.onCuff;
                    onCuff.installments = buildInstallments(onCuff);
                }
            }

            // Publish to be tested
            this.buildInstallments = buildInstallments;
            this.numberOfInstallmentsWatcherCallback = numberOfInstallmentsWatcherCallback;
            this.duedateWatcherCallback = duedateWatcherCallback;

            // Block undesired access.
            this.shouldOpen(DialogService, $scope.total.change);

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
                OnCuffPaymentService.recalcInstallments(index, onCuff);
            };
            
            /**
             * Calculate the total amount on top of screen.
             * 
             */
            $scope.recalcTotalAmount = function(){
                disableAmountWatcher();
                $scope.onCuff.amount = 0;
                for(var ix in $scope.onCuff.installments){
                    $scope.onCuff.amount += $scope.onCuff.installments[ix].amount;
                }
                enableAmountWatcher();
            };

            /**
             * Register on PaymentService temporary storage the onCuff payments
             * and go home.
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
             * OnCuff numberOfInstallments watcher.
             * 
             * Every number of installments change, will update all onCuff
             * installments.
             */
            $scope.$watch('onCuff.numberOfInstallments', numberOfInstallmentsWatcherCallback);

            // ################################################################################################
            // This enable and disable watcher.
            // ################################################################################################
            var amountWatcher = angular.noop;
            
            function enableAmountWatcher() {
                amountWatcher = $scope.$watch('onCuff.amount', numberOfInstallmentsWatcherCallback); 
            }

            function disableAmountWatcher() {
                amountWatcher();
            };
            
            enableAmountWatcher();
            
            /**
             * OnCuff duedate watcher.
             * 
             * Every duedate will update all onCuff installments.
             */
            $scope.$watch('onCuff.duedate', duedateWatcherCallback);
        }
    ]);
})(angular);
