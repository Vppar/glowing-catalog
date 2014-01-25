(function(angular) {
    'use strict';
    angular.module('tnt.catalog.payment', [
        'tnt.catalog.inventory.entity', 'tnt.catalog.inventory.keeper', 'tnt.catalog.payment.entity'
    ]).controller(
            'PaymentCtrl',
            function($scope, $filter, $location, $q, $log, ArrayUtils, DataProvider, DialogService, OrderService, PaymentService, SMSService,
                    KeyboardService, InventoryKeeper, CashPayment) {

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
                // $scope.$watch('total.payments.cash', cashPayment);

                // Controls which left fragment will be shown
                $scope.selectedPaymentMethod = 'none';

                // Controls the num pad.
                $scope.isNumPadVisible = isNumPadVisible;

                // Define the customer
                var customer = $filter('findBy')(DataProvider.customers, 'id', order.customerId);
                $scope.customer = customer;

                // When a product is added on items list, we need to rebuild the
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
                            }
                        }
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
                    if ($scope.selectedPaymentMethod === 'money') {
                        cashPayment();
                    }
                    updateOrderAndPaymentTotal();
                    $scope.selectedPaymentMethod = method;
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
                            updateOrderAndPaymentTotal();
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
                        dialogPromise.then(updateOrderAndPaymentTotal);
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
                function cancelPayment() {
                    OrderService.order.canceled = true;
                    makePayment();
                    PaymentService.remove(new CashPayment(0));
                    $location.path('/');
                }

                function cashPayment() {
                    var payment = new CashPayment($scope.total.payments.cash);
                    PaymentService.add(payment);
                    updateOrderAndPaymentTotal();
                }

                function updateOrderAndPaymentTotal() {
                    // Calculate the Subtotal
                    if (order.items) {

                        // Payment total
                        $scope.total.payments.cash = PaymentService.list('cash');
                        $scope.total.payments.check = PaymentService.list('check');
                        $scope.total.payments.creditCard = PaymentService.list('creditCard');
                        $scope.total.payments.exchange = PaymentService.list('exchange');
                        $scope.total.payments.coupon = PaymentService.list('coupon');
                        $scope.total.payments.onCuff = PaymentService.list('onCuff');

                        var totalPayments = $scope.total.payments.cash.amount;
                        for ( var ix in $scope.total.payments) {
                            totalPayments += $filter('sum')($scope.total.payments[ix], 'amount');
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
                    // var savedOrder = OrderService.save();
                    OrderService.save();
                    OrderService.clear();
                    // var savedPayments = PaymentService.save(savedOrder.id,
                    // savedOrder.customerId);

                    PaymentService.clear();

                    createCoupons();

                    // for ( var idx in savedPayments) {
                    // var savedPayment = savedPayments[idx];
                    // savedOrder.paymentIds.push(savedPayment.id);
                    // }
                    return true;
                }

                /**
                 * Ends of the payment process, return the main screen and alert
                 * the user.s
                 */
                function paymentDone() {
                    $location.path('/');
                    // return dialogService.messageDialog({
                    // title : 'Pagamento',
                    // message : 'Pagamento efetuado!',
                    // btnYes : 'OK',
                    // });
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



                /////////////////////////////////////
                // Coupon handling
                var errorMessage =
                        'Ocorreram erros na geração dos cupons. Na próxima sincronização do sistema um administrador será acionado.';
                var oneCouponMessage =
                        'Foi gerado 1 cupom promocional no total de R$ {{coupomsValue}} para o cliente {{customerFirstName}}.';
                var moreThanOneCouponMessage =
                        'Foram gerados {{couponNumber}} cupons promocionais no total de R$ {{couponsValue}} para o cliente {{customerFirstName}}.';

                /** Checks if all coupons in an array are ok (have no 'err' attribute). */
                function allCouponsOk(coupons) {
                  var len, i;

                  for (i = 0, len = coupons.length; i < len; i += 1) {
                    if (coupons[i].err) { return false; }
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
                  var
                    customerId = order.customerId,

                    // An array of coupons. Coupons have the following attributes:
                    //  - amount {Number} The value of the coupon;
                    //  - err {Error} An error thrown during the coupon generation (present
                    //    only if an error occurred);
                    //
                    // NOTE: Coupons are generated INDIVIDUALLY, thats why there is no
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

                    $log.fatal(new Date() + ' - There were problems in creating coupons. \n client ID:' +
                        customerId + '\n' + 'Processed coupons:' + JSON.stringify(processedCoupons));
                    // TODO: should we keep track in journal?
                  }

                  // TODO: Remove this dialog messages (keeping them just for debug)
                  if (processedCoupons.successQty) {
                    var successMsg = '';
                    var totalAmount = $filter('currency')(processedCoupons.successAmount, '');

                    if (processedCoupons.successQty === 1) {
                      successMsg = oneCouponMessage
                        .replace('{{couponsValue}}', totalAmount)
                        .replace('{{customerFirstName}}', $scope.customer.name);
                    } else {
                      successMsg = moreThanOneCouponMessage
                        .replace('{{couponNumber}}', processedCoupons.successQty)
                        .replace('{{couponsValue}}', totalAmount)
                        .replace('{{customerFirstName}}', $scope.customer.name);

                    }

                    DialogService.messageDialog({
                      title : 'Cupom Promocional',
                      message : successMsg,
                      btnYes : 'OK'
                    });
                  }
                };
        
            });
}(angular));
