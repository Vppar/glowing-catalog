(function(angular) {
    'use strict';
    angular.module('tnt.catalog.payment', [
        'tnt.catalog.inventory.entity', 'tnt.catalog.inventory.keeper', 'tnt.catalog.payment.entity'
    ]).controller(
            'PaymentCtrl',
            function($scope, $filter, $location, $q, $log, ArrayUtils, DataProvider, DialogService, OrderService, PaymentService,
                    SMSService, KeyboardService, InventoryKeeper, CashPayment) {



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

                $scope.voucherFilter = function(item) {
                    if (item.type === 'voucher' || item.type === 'giftCard') {
                        return true;
                    } else {
                        return false;
                    }
                };

                $scope.items = order.items;

                $scope.keyboard = KeyboardService.getKeyboard();

                var isNumPadVisible = false;


                // See updateTotals() to see how this objects are populated
                $scope.totals = {};

                $scope.totals.payments = {
                  cash    : {total : 0, qty : 0},
                  check   : {total : 0, qty : 0},
                  coupon : {total : 0, qty : 0},
                  creditCard : {total : 0, qty : 0},
                  exchange : {total : 0, qty : 0},
                  onCuff : {total : 0, qty : 0},
                  total : 0,
                  change : 0,
                  remaining : 0
                };

                $scope.totals.order = {
                  // Total order value
                  total : 0,

                  // Sum of the quantities of all items in the order
                  qty : 0,

                  // Number of items in the order (item types, not quantities)
                  items : 0
                };


                // #################################################
                // Event handling
                function triggerValuesChangedEvent() {
                  $scope.$broadcast('PaymentCtrl.valuesChanged');
                }

                function updateTotals() {
                  $scope.totals.order.total = OrderService.getOrderTotal();
                  $scope.totals.order.qty = OrderService.getItemsQuantity();
                  $scope.totals.order.itemsCount = OrderService.getItemsCount();

                  $scope.totals.payments.cash.total = PaymentService.getTotal('cash');
                  $scope.totals.payments.cash.qty = PaymentService.getPaymentCount('cash');

                  $scope.totals.payments.check.total = PaymentService.getTotal('check');
                  $scope.totals.payments.check.qty = PaymentService.getPaymentCount('check');

                  $scope.totals.payments.creditCard.total = PaymentService.getTotal('creditCard');
                  $scope.totals.payments.creditCard.qty = PaymentService.getPaymentCount('creditCard');

                  $scope.totals.payments.exchange.total = PaymentService.getTotal('exchange');
                  $scope.totals.payments.exchange.qty = PaymentService.getPaymentCount('exchange');

                  $scope.totals.payments.coupon.total = PaymentService.getTotal('coupon');
                  $scope.totals.payments.coupon.qty = PaymentService.getPaymentCount('coupon');

                  $scope.totals.payments.onCuff.total = PaymentService.getTotal('onCuff');
                  $scope.totals.payments.onCuff.qty = PaymentService.getPaymentCount('onCuff');

                  $scope.totals.payments.total = PaymentService.getTotal();
                  $scope.totals.payments.change = PaymentService.getChange($scope.totals.order.total);
                  $scope.totals.payments.remaining = PaymentService.getRemainingAmount($scope.totals.order.total);
                }

                function clearOnCuffPayments() {
                  if ($scope.totals.payments.change || $scope.totals.payments.remaining) {
                    PaymentService.clear('onCuff');
                  }
                }


                $scope.$on('OrderService.orderItemsChanged', triggerValuesChangedEvent);
                $scope.$on('PaymentService.paymentsChanged', triggerValuesChangedEvent);

                $scope.$on('PaymentCtrl.valuesChanged', updateTotals);

                $scope.$on('PaymentCtrl.valuesChanged', clearOnCuffPayments);


                // Initialize totals
                updateTotals();

                /**
                 * Stores the amount paid in cash.
                 */
                // We need a separate model for storing the cash amount because we
                // are editing the cash amount directly from the payment
                // methods list, as oposed to all other methods. If we edit
                // the $scope.totals.payments.cash.total model directly, we create a loop with the
                // watcher where a new CashPayment is added and cleared immediately.
                $scope.cash = {
                    amount : $scope.totals.payments.cash.total
                };

                // Controls which left fragment will be shown
                $scope.selectedPaymentMethod = 'none';

                $scope.showPaymentButtons = true;

                // Controls the num pad.
                $scope.isNumPadVisible = isNumPadVisible;

                // Define the customer
                var customer = $filter('findBy')(DataProvider.customers, 'id', order.customerId);
                $scope.customer = customer;

                // When a product is added on items list, we need to
                // rebuild the
                // uniqueName.
                $scope.$watchCollection('items', function() {
                    // Show SKU or SKU + Option(when possible).
                    for ( var idx in order.items) {
                        var item = order.items[idx];
                        item.idx = Number(idx);
                        if (item.type !== 'giftCard' && item.type !== 'voucher') {
                            if (item.option) {
                                item.uniqueName = item.SKU + ' - ' + item.option;
                            } else {
                                item.uniqueName = item.SKU;
                            }
                        }
                    }
                });

                $scope.$watch('cash.amount', function() {
                    PaymentService.clear('cash');

                    if ($scope.cash.amount != 0) {
                        PaymentService.add(new CashPayment($scope.cash.amount));
                    }
                });

                // Publishing dialog service
                var dialogService = DialogService;
                $scope.dialogService = dialogService;

                $scope.openDialogChooseCustomer = function() {
                    dialogService.openDialogChooseCustomer().then(function(id) {
                        customer = $filter('findBy')(DataProvider.customers, 'id', id);
                        $scope.customer = customer;

                        // Propagate customer to order
                        order.customerId = customer.id;

                        // Update vouchers with new customer
                        var items = order.items, item, len, i;
                        for (i = 0, len = items.length; i < len; i += 1) {
                            item = items[i];
                            if (item.type === 'voucher') {
                                item.uniqueName = customer.name;
                                item.entity = customer.id;
                            }
                        }
                        PaymentService.clear('coupon');
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
                    $scope.showPaymentButtons = (method === 'none' || method === 'money');
                    $scope.selectedPaymentMethod = method;
                };

                $scope.selectMoneyPayment = function selectMoneyPayment() {
                    // FIXME - Used to temporally resolve VOPP-210.
                    var delta = new Date().getTime() - $scope.keyboard.status.changed;
                    delta = isNaN(delta) ? 501 : delta;
                    if (!$scope.keyboard.status.active && delta > 500) {
                        $scope.selectPaymentMethod('money');
                    }
                };

                $scope.addToBasket = function addToBasket(item) {
                    if (item.type === 'giftCard') {
                        DialogService.messageDialog({
                            title : 'Pagamento',
                            message : 'Confirmar a exclusão do Vale Presente?',
                            btnYes : 'Sim',
                            btnNo : 'Não'
                        }).then(function(result) {
                            if (result) {
                                var idx = OrderService.order.items.indexOf(item);
                                OrderService.order.items.splice(idx, 1);
                            }
                        });
                    } else if (!item.type) {
                        var product = ArrayUtils.filter(DataProvider.products, {
                            id : item.id
                        })[0];

                        var grid = ArrayUtils.list(InventoryKeeper.read(), 'parent', product.parent);
                        var dialogPromise = null;

                        if (grid.length > 1) {
                            dialogPromise = DialogService.openDialogAddToBasketDetails({
                                id : product.parent
                            });
                        } else {
                            dialogPromise = DialogService.openDialogAddToBasket({
                                id : product.parent
                            });
                        }
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
                        message : 'Confirmar o pagamento?',
                        btnYes : 'Sim',
                        btnNo : 'Não'
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
                        title : 'Cancelar Pedido?',
                        message : 'Deseja cancelar este pedido?',
                        btnYes : 'Sim',
                        btnNo : 'Não'
                    });
                }

                /**
                 * Cancel the payment and redirect to the main screen.
                 */
                function cancelPayment(result) {
                    if (!result) {
                        main();
                        return $q.reject();
                    }
                    OrderService.clear();
                    PaymentService.clearAllPayments();
                    PaymentService.clearPersistedCoupons();

                    $location.path('/');
                }


                // #############################################################################################
                // Main related functions
                // #############################################################################################

                /**
                 * Saves the payments and closes the order.
                 */
                // FIXME - This method do nothing right.
                function makePayment(result) {
                    if (!result) {
                        main();
                        return $q.reject();
                    }
                    OrderService.save();
                    OrderService.clear();

                    PaymentService.clearAllPayments();
                    createCoupons();
                    PaymentService.clearPersistedCoupons();

                    return true;
                }

                /**
                 * Ends of the payment process, return the main screen and alert
                 * the user.s
                 */
                function paymentDone() {
                    $location.path('/');
                }

                /**
                 * Sends the SMS to the customer about his order.
                 */
                function sendAlertSMSAttempt() {
                    return SMSService.sendPaymentConfirmation(customer, $scope.totals.order.total);
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

                // ///////////////////////////////////
                // Coupon handling
                var errorMessage =
                        'Ocorreram erros na geração dos cupons. Na próxima sincronização do sistema um administrador será acionado.';
                /**
                 * Checks if all coupons in an array are ok (have no 'err'
                 * attribute).
                 */
                function allCouponsOk(coupons) {
                    var len, i;

                    for (i = 0, len = coupons.length; i < len; i += 1) {
                        if (coupons[i].err) {
                            return false;
                        }
                    }

                    return true;
                }

                /** Logs errors in failed coupons, if any. */
                function logCouponErrors(coupons) {
                    var coupon, len, i;
                    for (i = 0, len = coupons.length; i < len; i += 1) {
                        coupon = coupons[i];
                        if (coupon.err) {
                            $log.error(coupon.err);
                        }
                    }
                }

                /**
                 * Creates all coupons persisted in the PaymentService.
                 */
                function createCoupons() {
                    var customerId = order.customerId,

                    // An array of coupons. Coupons have the following
                    // attributes:
                    // - amount {Number} The value of the coupon;
                    // - err {Error} An error thrown during the coupon
                    // generation (present
                    // only if an error occurred);
                    //
                    // NOTE: Coupons are generated INDIVIDUALLY, thats
                    // why there is no
                    // qty attribute in this coupon objects.
                    processedCoupons = PaymentService.createCoupons(customerId);

                    if (!allCouponsOk(processedCoupons)) {
                        DialogService.messageDialog({
                            title : 'Cupom promocional',
                            message : errorMessage,
                            btnYes : 'OK'
                        });

                        $log.error('One or more coupons failed!');
                        logCouponErrors(processedCoupons);

                        $log.fatal(new Date() + ' - There were problems in creating coupons. \n client ID:' + customerId + '\n' +
                            'Processed coupons:' + JSON.stringify(processedCoupons));
                        // TODO: should we keep track in journal?
                    }
                }
            });
}(angular));
