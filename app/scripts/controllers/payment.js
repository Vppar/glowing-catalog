(function(angular) {
    'use strict';
    angular.module('tnt.catalog.payment', []).controller(
            'PaymentCtrl',
            function($scope, $filter, $location, $q, ArrayUtils, DataProvider, DialogService, OrderService, PaymentService, SMSService) {

                // #############################################################################################
                // Controller warm up
                // #############################################################################################

                // Payment variables
                var payments = {};
                $scope.payment = {};
                $scope.coupon = {
                    total : 0
                };

                // Easy the access in the controller to external
                // resources
                var order = OrderService.order;
                var isNumPadVisible = false;

                // Controls which left fragment will be shown
                $scope.selectedPaymentMethod = 'none';

                // Controls the num pad.
                $scope.isNumPadVisible = isNumPadVisible;

                // Define the customer
                var customer = $filter('findBy')(DataProvider.customers, 'id', order.customerId);
                $scope.customer = customer;

                // Calculate the Subtotal
                if (order.items) {
                    var basket = order.items;
                    var orderItemsQty = basket ? basket.length : 0;
                    var orderUnitsQty = $filter('sum')(basket, 'qty');
                    var orderAmount = $filter('sum')(basket, 'price', 'qty');
                    $scope.orderAmount = orderAmount;
                    $scope.orderItemsQty = orderItemsQty;
                    $scope.orderUnitsQty = orderUnitsQty;
                }

                // Order list
                $scope.items = order.items;
                $scope.payments = PaymentService.payments;

                // Filters
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
                    payments = angular.copy(PaymentService.payments);
                    $scope.selectedPaymentMethod = method;
                };

                $scope.addToBasket = function addToBasket(productId) {
                    var product = ArrayUtils.filter(DataProvider.products, {
                        id : productId
                    })[0];

                    if (product.grid.length > 1) {
                        DialogService.openDialogAddToBasketDetails({
                            id : product.id
                        });
                    } else {
                        DialogService.openDialogAddToBasket({
                            id : product.id
                        });
                    }
                };

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
                    return SMSService.sendPaymentConfirmation(customer, orderAmount);
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
