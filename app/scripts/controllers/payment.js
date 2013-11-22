(function(angular) {
    'use strict';
    angular
            .module('tnt.catalog.payment', [])
            .controller(
                    'PaymentCtrl',
                    function($scope, $filter, $location, $q, DataProvider, DialogService, PaymentService, OrderService, SMSService) {

                        // #############################################################################################
                        // Controller warm up
                        // #############################################################################################

                        var order = OrderService.order;
                        var inBasketFilter = OrderService.inBasketFilter;
                        var basket = $filter('filter')(order.items, inBasketFilter);
                        var orderAmount = $filter('sum')(basket, 'price', 'qty');
                        var customer = $filter('findBy')(DataProvider.customers, 'id', order.customerId);

                        $scope.selectedPaymentMethod = 'none';
                        $scope.customer = customer;
                        $scope.orderAmount = orderAmount;
                        $scope.inBasketFilter = inBasketFilter;
                        $scope.items = order.items;
                        $scope.payments = PaymentService.payments;
                        $scope.findPaymentTypeByDescription = PaymentService.findPaymentTypeByDescription;

                        // There can be only one cash payment, so we have to
                        // find one if exists if not create a new one.
                        var cashPayment = $filter('filter')(PaymentService.payments, PaymentService.paymentTypeFilter, 'cash');
                        if (cashPayment.length > 0) {
                            $scope.cash = cashPayment[0];
                        } else {
                            $scope.cash = PaymentService.createNew('cash');
                        }

                        // #############################################################################################
                        // Screen action functions
                        // #############################################################################################

                        /**
                         * Select the payment method changing the left fragment
                         * that will be shown.
                         * 
                         * @param method - payment method.
                         */
                        $scope.selectPaymentMethod = function selectPaymentMethod(method) {
                            $scope.selectedPaymentMethod = method;
                        };

                        /**
                         * Triggers the payment confirmation process by showing
                         * the confirmation dialog.
                         */
                        function paymentFactory() {
                            var paymentIntent = $q.defer();
                            var confirmedPaymentPromise = paymentIntent.promise.then(showPaymentConfirmationDialog);

                            $scope.confirm = paymentIntent.resolve;

                            return confirmedPaymentPromise;
                        }
                        /**
                         * Shows the payment confirmation dialog.
                         */
                        function showPaymentConfirmationDialog() {
                            return DialogService.messageDialog({
                                title : 'Pagamento',
                                message : 'Deseja confirmar o pagamento?',
                                btnYes : 'Confirmar',
                                btnNo : 'Cancelar'
                            });
                        }

                        /**
                         * Triggers the payment canceling process by showing the
                         * confirmation dialog.
                         */
                        function cancelPaymentFactory() {
                            var cancelPaymentIntent = $q.defer();
                            var canceledPaymentPromise = cancelPaymentIntent.promise.then(showCancelPaymentDialog);

                            $scope.cancel = cancelPaymentIntent.resolve;

                            return canceledPaymentPromise;
                        }
                        /**
                         * Shows the payment canceling dialog.
                         */
                        function showCancelPaymentDialog() {
                            return DialogService
                                    .messageDialog({
                                        title : 'Cancelar Pagamento',
                                        message : 'Cancelar o pagamento irá descartar os dados desse pagamento permanentemente. Você tem certeza que deseja cancelar?',
                                        btnYes : 'Cancelar',
                                        btnNo : 'Retornar'
                                    });
                        }

                        /**
                         * Cancel the payment and redirect to the main screen.
                         */
                        function cancelPayment() {
                            PaymentService.clear();
                            $location.path('/');
                        }

                        // #############################################################################################
                        // Main related functions
                        // #############################################################################################

                        /**
                         * Checks out if the payment is valid.
                         */
                        function validatePayment() {
                            var paymentAmount = $filter('sum')($scope.payments, 'amount');

                            if (paymentAmount > 0 && paymentAmount === orderAmount) {
                                return true;
                            }

                            var message = null;
                            if (paymentAmount === 0) {
                                message = 'Nenhum pagamento foi registrado para o pedido.';
                            } else if (paymentAmount > orderAmount) {
                                message = 'Valor registrado para pagamento é maior do que o valor total do pedido.';
                            } else if (paymentAmount < orderAmount) {
                                message = 'Valor registrado para pagamento é menor do que o valor total do pedido.';
                            }
                            return $q.reject(message);
                        }

                        /**
                         * Saves the payments and closes the order.
                         */
                        function makePayment() {
                            var savedOrder = OrderService.save();
                            OrderService.clear();
                            var savedPayments = PaymentService.save(savedOrder.id, savedOrder.customerId);
                            PaymentService.clear();

                            for ( var idx in savedPayments) {
                                var savedPayment = savedPayments[idx];
                                savedOrder.paymentIds.push(savedPayment.id);
                            }
                            return true;
                        }

                        /**
                         * Cancels the payments with an alert message.
                         * 
                         * @param message - Alert message to the user.
                         */
                        function abortPayment(message) {
                            // rebuild main promise chain.
                            main();
                            // show the dialog.
                            DialogService.messageDialog({
                                title : 'Pagamento inválido',
                                message : message,
                                btnYes : 'OK',
                            });
                            return $q.reject();
                        }

                        /**
                         * Ends of the payment process, return the main screen
                         * and alert the user.s
                         */
                        function paymentDone() {
                            $location.path('/');
                            return DialogService.messageDialog({
                                title : 'Pagamento',
                                message : 'Pagamento efetuado!',
                                btnYes : 'OK',
                            });
                        }

                        /**
                         * Sends the SMS to the customer about his order.
                         */
                        function sendAlertSMSAttempt() {
                            return SMSService.sendPaymentConfirmation(customer, orderAmount).then(smsAlert, smsAlert);
                        }

                        /**
                         * Confirmation SMS alert.
                         */
                        function smsAlert(message) {
                            return DialogService.messageDialog({
                                title : 'Pagamento',
                                message : message,
                                btnYes : 'OK',
                            });
                        }

                        /**
                         * Main function responsible for chaining the
                         * confirmation and cancel processes.
                         */
                        function main() {
                            // Execute when payment is confirmed.
                            var confirmedPaymentPromise = paymentFactory();
                            var validatedPaymentPromise = confirmedPaymentPromise.then(validatePayment, main);
                            var paidPromise = validatedPaymentPromise.then(makePayment, abortPayment);

                            // Inform the user that the payment is done.
                            paidPromise.then(paymentDone);

                            // Send the alert SMS to the customer.
                            paidPromise.then(sendAlertSMSAttempt);

                            // Cancel payment
                            var canceledPaymentPromise = cancelPaymentFactory();
                            canceledPaymentPromise.then(cancelPayment, main);
                        }

                        main();
                    });
}(angular));
