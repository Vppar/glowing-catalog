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

                        // Payment variables
                        var payments = {};
                        $scope.payment = {};

                        // Easy the access in the controller to external
                        // resources
                        var order = OrderService.order;
                        var customer = $filter('findBy')(DataProvider.customers, 'id', order.customerId);
                        var inBasketFilter = OrderService.inBasketFilter;

                        // Controls which left fragment will be shown
                        $scope.selectedPaymentMethod = 'none';

                        // Calculate the order amount and item qty
                        var basket = $filter('filter')(order.items, inBasketFilter);
                        $scope.orderQty = basket.length;
                        var orderAmount = $filter('sum')(basket, 'price', 'qty');
                        $scope.orderAmount = orderAmount;

                        // Scope binding to needed external resources
                        $scope.customer = customer;
                        $scope.items = order.items;
                        $scope.payments = PaymentService.payments;

                        // Filters
                        $scope.inBasketFilter = inBasketFilter;
                        $scope.findPaymentTypeByDescription = PaymentService.findPaymentTypeByDescription;

                        // There can be only one cash payment, so we have to
                        // find one if exists if not create a new one.
                        var cashPayment = $filter('paymentType')(PaymentService.payments, 'cash');
                        if (cashPayment.length > 0) {
                            $scope.payment.cash = cashPayment[0];
                        } else {
                            $scope.payment.cash = PaymentService.createNew('cash');
                        }

                        // #############################################################################################
                        // Screen action functions
                        // #############################################################################################

                        /**
                         * Confirms the check payments and redirect to the order
                         * items. This will be used by the left fragments that
                         * inherits this scope
                         */
                        $scope.confirmPayments = function confirmPayments() {
                            payments.length = $scope.payments.length;
                            angular.extend(payments, $scope.payments);
                            $scope.selectPaymentMethod('none');
                        };

                        /**
                         * Cancels the check payments keeping the old ones and
                         * redirect to the order items. This will be used by the
                         * left fragments that inherits this scope, they only
                         */
                        $scope.cancelPayments = function cancelPayments() {
                            $scope.payments.length = payments.length;
                            // don't lose the cash amount, cash amount is
                            // persistence everywhere
                            payments[0] = $scope.payments[0];

                            angular.extend($scope.payments, payments);

                            // recreate the binding to the cash value
                            $scope.payment.cash = $scope.payments[0];

                            $scope.selectPaymentMethod('none');
                        };

                        /**
                         * Select the payment method changing the left fragment
                         * that will be shown.
                         * 
                         * @param method - payment method.
                         */
                        $scope.selectPaymentMethod = function selectPaymentMethod(method) {
                            // if ($scope.selectedPaymentMethod === 'none') {
                            // // backup up the payments in case you decide to
                            // // click in cancel when in a payment fragment
                            // payments = angular.copy(PaymentService.payments);
                            // } else {
                            // // recover the payments in case you
                            // // decide to click in another fragment
                            // $scope.payments.length = payments.length;
                            // angular.extend($scope.payments, payments);
                            // }
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
                            return SMSService.sendPaymentConfirmation(customer, orderAmount);
                        }

                        /**
                         * Confirmation SMS alert.
                         */
                        // function smsAlert(message) {
                        // return DialogService.messageDialog({
                        // title : 'Pagamento',
                        // message : message,
                        // btnYes : 'OK',
                        // });
                        // }

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
