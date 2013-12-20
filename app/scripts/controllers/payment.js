(function(angular) {
    'use strict';
    angular.module('tnt.catalog.payment', []).controller(
            'PaymentCtrl', function($scope, $filter, $location, $q, DataProvider, DialogService, PaymentService, OrderService, SMSService) {

                // #############################################################################################
                // Controller warm up
                // #############################################################################################

                // Payment variables
                var payments = {};
                $scope.payment = {};

                // Easy the access in the controller to external
                // resources
                var order = OrderService.order;
                var inBasketFilter = OrderService.inBasketFilter;

                // Controls which left fragment will be shown
                $scope.selectedPaymentMethod = 'none';

                // Define the customer
                var customer = $filter('findBy')(DataProvider.customers, 'id', order.customerId);
                $scope.customer = customer;

                // Calculate the Subtotal
                var basket = $filter('filter')(order.items, inBasketFilter);
                var orderItemsQty = basket ? basket.length : 0;
                var orderUnitsQty = $filter('sum')(basket, 'qty');
                var orderAmount = $filter('sum')(basket, 'price', 'qty');
                $scope.orderAmount = orderAmount;
                $scope.orderItemsQty = orderItemsQty;
                $scope.orderUnitsQty = orderUnitsQty;

                // Order list
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
                    $scope.payment.cash.amount = '0';
                }

                // Publishing dialog service
                var dialogService = DialogService;
                $scope.dialogService = dialogService;

                $scope.openDialogChooseCustomer = function() {
                    dialogService.openDialogChooseCustomer().then(function() {
                        customer = $filter('findBy')(DataProvider.customers, 'id', order.customerId);
                        $scope.customer = customer;
                    });
                };

                // #############################################################################################
                // Screen action functions
                // #############################################################################################

                /**
                 * Confirms the check payments and redirect to the order items.
                 * This will be used by the left fragments that inherits this
                 * scope
                 */
                $scope.confirmPayments = function confirmPayments() {
                    payments.length = $scope.payments.length;
                    angular.extend(payments, $scope.payments);
                    $scope.selectPaymentMethod('none');
                };

                /**
                 * Cancels the check payments keeping the old ones and redirect
                 * to the order items. This will be used by the left fragments
                 * that inherits this scope, they only
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
                 * Select the payment method changing the left fragment that
                 * will be shown.
                 * 
                 * @param method - payment method.
                 */
                $scope.selectPaymentMethod = function selectPaymentMethod(method) {
                    // if ($scope.selectedPaymentMethod === 'none') {
                    // backup up the payments in case you decide to
                    // click in cancel when in a payment fragment
                    payments = angular.copy(PaymentService.payments);
                    // } else {
                    // // recover the payments in case you
                    // // decide to click in another fragment
                    // $scope.payments.length = payments.length;
                    // angular.extend($scope.payments, payments);
                    // }
                    $scope.selectedPaymentMethod = method;
                };

                $scope.pushMoneyDigit = function pushMoneyDigit(digit) {
                    var amount = $scope.payment.cash.amount;
                    amount += digit;
                    amount = shiftPoint(amount);
                    $scope.payment.cash.amount = amount;
                };
                $scope.removeMoneyDigit = function removeMoneyDigit() {
                    var amount = $scope.payment.cash.amount;
                    amount = amount.slice(0, -1);
                    if (amount.length > 0) {
                        amount = shiftPoint(amount);
                        $scope.payment.cash.amount = amount;
                    } else {
                        $scope.payment.cash.amount = '0';
                    }
                };
                $scope.clearMoney = function clearMoney() {
                    if ($scope.payment.cash && $scope.payment.cash.amount) {
                        $scope.payment.cash.amount = '0';
                    }
                };

                function shiftPoint(amount) {
                    amount = amount.replace('.', '');
                    if (amount.length == 1) {
                        amount = '0.0' + amount;
                    } else if (amount.length == 2) {
                        amount = '0.' + amount;
                    } else {
                        amount = amount.substring(0, amount.length - 2) + '.' + amount.substring(amount.length - 2);
                    }
                    return amount;
                }

                /**
                 * Triggers the payment confirmation process by showing the
                 * confirmation dialog.
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
                    var result = dialogService.messageDialog({
                        title : 'Pagamento',
                        message : 'Deseja confirmar o pagamento?',
                        btnYes : 'Confirmar',
                        btnNo : 'Cancelar'
                    });
                    return result;
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
                    return dialogService.messageDialog({
                        title : 'Cancelar Pagamento',
                        message : 'Confirmar o cancelamento do pedido?',
                        btnYes : 'Cancelar',
                        btnNo : 'Retornar'
                    });
                }

                /**
                 * Cancel the payment and redirect to the main screen.
                 */
                function cancelPayment() {
                    OrderService.order.canceled = true;
                    makePayment();
                    $location.path('/');
                }

                // #############################################################################################
                // Main related functions
                // #############################################################################################

                /**
                 * Checks out if the payment is valid.
                 */
                function isPaymentValid() {
                    var isValid = false;
                    var paymentAmount = $filter('sum')($scope.payments, 'amount');
                    if (paymentAmount > 0 && paymentAmount === orderAmount) {
                        isValid = true;
                    }
                    return isValid;
                }
                $scope.isPaymentValid = isPaymentValid;

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
                 * Ends of the payment process, return the main screen and alert
                 * the user.s
                 */
                function paymentDone() {
                    $location.path('/');
                    return dialogService.messageDialog({
                        title : 'Pagamento',
                        message : 'Pagamento efetuado!',
                        btnYes : 'OK',
                    });
                }

                /**
                 * Sends the SMS to the customer about his order.
                 */
                function sendAlertSMSAttempt() {
                    return SMSService.sendPaymentConfirmation(customer, orderAmount).then(null, smsAlert);
                }

                /**
                 * Confirmation SMS alert.
                 */
                function smsAlert(message) {
                    return dialogService.messageDialog({
                        title : 'Pagamento',
                        message : message,
                        btnYes : 'OK',
                    });
                }

                /**
                 * Main function responsible for chaining the confirmation and
                 * cancel processes.
                 */
                function main() {
                    // Execute when payment is confirmed.
                    var confirmedPaymentPromise = paymentFactory();
                    var paidPromise = confirmedPaymentPromise.then(makePayment, function() {
                        main();
                        return $q.reject();
                    });

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
