(function(angular) {
    'use strict';
    angular.module('tnt.catalog.payment', []).controller(
            'PaymentCtrl',
            function($scope, $filter, $location, $q, ArrayUtils, DataProvider, DialogService, OrderService, PaymentService, SMSService) {

                // #############################################################################################
                // Controller warm up
                // #############################################################################################

                // First of all block undesired accesses.
                // Easy the access in the controller to external
                // resources
                var order = OrderService.order;
                if (!order.customerId) {
                    $location.path('/');
                }
                $scope.items = order.items;

                var isNumPadVisible = false;

                // Payment variables
                $scope.total = {
                    payments : {
                        cash : 0,
                        check : [],
                        creditCard : [],
                        exchange : [],
                        coupon : []
                    },
                    order : {
                        amount : 0,
                        qty : 0,
                        unit : 0
                    },
                    change : 0
                };
                $scope.$watch('total.payments.cash', updateOrderAndPaymentTotal);

                $scope.coupon = {
                    total : 0
                };

                // Controls which left fragment will be shown
                $scope.selectedPaymentMethod = 'none';

                // Controls the num pad.
                $scope.isNumPadVisible = isNumPadVisible;

                // Define the customer
                var customer = $filter('findBy')(DataProvider.customers, 'id', order.customerId);
                $scope.customer = customer;

                // Show SKU or SKU + Option(when possible).
                for ( var idx in order.items) {
                    var item = order.items[idx];
                    if (order.items[idx].option) {
                        item.uniqueName = item.SKU + ' - ' + item.option;
                    } else {
                        item.uniqueName = item.SKU;
                    }
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
                 * DEPRECATED
                 * 
                 * Confirms the check payments and redirect to the order items.
                 * This will be used by the left fragments that inherits this
                 * scope
                 */
                $scope.confirmPayments = function confirmPayments() {
                    $scope.selectPaymentMethod('none');
                };

                /**
                 * DEPRECATED
                 * 
                 * Cancels the check payments keeping the old ones and redirect
                 * to the order items. This will be used by the left fragments
                 * that inherits this scope, they only
                 */
                $scope.cancelPayments = function cancelPayments() {
                    $scope.selectPaymentMethod('none');
                };

                /**
                 * Select the payment method changing the left fragment that
                 * will be shown.
                 * 
                 * @param method - payment method.
                 */
                $scope.selectPaymentMethod = function selectPaymentMethod(method) {
                    updateOrderAndPaymentTotal();
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

                function updateOrderAndPaymentTotal() {
                    // Calculate the Subtotal
                    if (order.items) {
                        // Payment total
                        $scope.total.payments.check = PaymentService.list('check');
                        $scope.total.payments.creditCard = PaymentService.list('creditCard');
                        $scope.total.payments.exchange = PaymentService.list('exchange');
                        $scope.total.payments.coupon = PaymentService.list('coupon');

                        var totalPayments = $scope.total.payments.cash;
                        
                        for ( var ix in $scope.total.payments) {
                            totalPayments += $filter('sum')($scope.total.payments[ix],'amount');
                        }

                        // Order total
                        var basket = order.items;
                        
                        $scope.total.order.amount = $filter('sum')(basket, 'price', 'qty');
                        $scope.total.order.unit = $filter('sum')(basket, 'qty');
                        $scope.total.order.qty = basket ? basket.length : 0;
                        
                        // Change
                        $scope.total.change = Math.round((totalPayments - $scope.total.order.amount) * 100) / 100;
                    }
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

                    $scope.selectPaymentMethod('none');
                }

                main();
            });
}(angular));
