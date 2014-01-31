(function(angular) {
    'use strict';
    angular
            .module('tnt.catalog.payment', [
                'tnt.catalog.inventory.entity', 'tnt.catalog.inventory.keeper', 'tnt.catalog.payment.entity'
            ])
            .controller(
                    'PaymentCtrl',
                    function($scope, $filter, $location, $q, $log, ArrayUtils, DataProvider, DialogService, OrderService, PaymentService,
                            ReceivableService,ProductReturnService, SMSService, KeyboardService, InventoryKeeper, CashPayment) {

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
                                cash : [],
                                check : [],
                                creditCard : [],
                                exchange : [],
                                coupon : [],
                                onCuff : []
                            },
                            order : {
                                amount : 0,
                                qty : 0,
                                unit : 0
                            },
                            change : 0
                        };

                        /**
                         * Gets the current cash amount from the cash payments
                         * array.
                         */
                        function getCashAmount() {
                            var cash = PaymentService.list('cash')[0];
                            return (cash && cash.amount) || 0;
                        }

                        /**
                         * Stores the amount paid in cash.
                         */
                        // We need a model for storing the cash amount because
                        // we
                        // are editing the cash amount directly from the payment
                        // methods list, as oposed to all other methods.
                        $scope.cash = {
                            amount : getCashAmount()
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
                                var cash = new CashPayment($scope.cash.amount);
                                cash.duedate = new Date().getTime();
                                PaymentService.add(cash);
                            }
                            updateOrderAndPaymentTotal();
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
                                $scope.total.payments.coupon.length = 0;
                                updateOrderAndPaymentTotal();
                            });
                        };

                        // #############################################################################################
                        // Screen action functions
                        // #############################################################################################

                        /**
                         * DEPRECATED
                         * 
                         * Confirms the check payments and redirect to the order
                         * items. This will be used by the left fragments that
                         * inherits this scope
                         */
                        $scope.confirmPayments = function confirmPayments() {
                            $scope.selectPaymentMethod('none');
                        };

                        /**
                         * DEPRECATED
                         * 
                         * Cancels the check payments keeping the old ones and
                         * redirect to the order items. This will be used by the
                         * left fragments that inherits this scope, they only
                         */
                        $scope.cancelPayments = function cancelPayments() {
                            $scope.selectPaymentMethod('none');
                        };

                        /**
                         * Select the payment method changing the left fragment
                         * that will be shown.
                         * 
                         * @param method - payment method.
                         */
                        $scope.selectPaymentMethod = function selectPaymentMethod(method) {
                            updateOrderAndPaymentTotal();
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

                                var totalPayments = 0;
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

                        $scope.$watch('total.change', function() {
                            if ($scope.total.change != 0) {
                                PaymentService.clear('onCuff');
                                updateOrderAndPaymentTotal();
                            }
                        });

                        // #############################################################################################
                        // Main related functions
                        // #############################################################################################

                        /**
                         * Checks out if the payment is valid.
                         */
                        function isPaymentValid() {
                            var isValid = false;
                            var paymentAmount = $filter('sum')($scope.payments, 'amount');
                            if (paymentAmount > 0 && paymentAmount >= $scope.total.order.amount) {
                                isValid = true;
                            }
                            return isValid;
                        }
                        $scope.isPaymentValid = isPaymentValid;

                        /**
                         * Saves the payments and closes the order.
                         */
                        function makePayment(result) {
                            if (!result) {
                                main();
                                return $q.reject();
                            }
                            // Save the order
                            var savedOrderPromise = OrderService.save();

                            // Generate receivables
                            var savedReceivablesPromise = savedOrderPromise.then(function(orderUuid) {
                                var receivables = PaymentService.getReceivables();
                                return ReceivableService.bulkRegister(receivables, customer, orderUuid);
                            }, propagateRejectedPromise);

                            // // Register product exchange
                             var savedExchangesPromise = savedOrderPromise.then(function(orderUuid) {
                                 var exchanges = PaymentService.list('exchange');
                                 return ProductReturnService.bulkRegister(exchanges, customer, orderUuid);
                             }, propagateRejectedPromise);
                             
                            //
                            // // Register voucher/coupons use
                            // var savedVouchersPromise =
                            // savedOrderPromise.then(function(orderUuid) {
                            //                                var vouchers = PaymentService.list('coupon');
                            //                                return VoucherService.bulkRegister(vouchers, customer, orderUuid);
                            //                            }, propagateRejectedPromise);

                            // Generate coupons
                            var savedCouponsPromise = savedOrderPromise.then(function(orderUuid) {
                                return PaymentService.createCoupons(customer, orderUuid);
                            }, propagateRejectedPromise);
                            savedCouponsPromise.then(function(coupons) {
                                evaluateCoupons(coupons);
                            }, propagateRejectedPromise);

                            // Sale saved
                            // var savedSale = $q.all([
                            // savedReceivablesPromise, savedExchangesPromise,
                            // savedVouchersPromise, savedCouponsPromise
                            //                            ]);
                            var savedSale = $q.all([
                                savedReceivablesPromise, savedCouponsPromise, savedExchangesPromise
                            ]);

                            // clear all
                            var paymentDonePromise = savedSale.then(function() {
                                $log.debug('Receivables created');
                                $log.debug(ReceivableService.list());
                                $log.debug('ProductReturns created ');
                                $log.debug(ProductReturnService.list());
                                OrderService.clear();
                                PaymentService.clearAllPayments();
                                PaymentService.clearPersistedCoupons();
                            }, propagateRejectedPromise);

                            return paymentDonePromise;
                        }

                        /**
                         * Ends of the payment process, return the main screen
                         * and alert the user.s
                         */
                        function paymentDone() {
                            $location.path('/');
                        }

                        /**
                         * Sends the SMS to the customer about his order.
                         */
                        function sendAlertSMSAttempt() {
                            return SMSService.sendPaymentConfirmation(customer, $scope.total.order.amount);
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

                        function propagateRejectedPromise(err) {
                            return $q.reject(err);
                        }

                        /**
                         * Main function responsible for chaining the
                         * confirmation and cancel processes.
                         */
                        function main() {
                            // Execute when payment is confirmed.
                            var confirmedPaymentPromise = paymentFactory();
                            var paidPromise = confirmedPaymentPromise.then(makePayment, function() {
                                main();
                                return $q.reject('canceledByUser');
                            });

                            // Inform the user that the payment is done.
                            paidPromise
                                    .then(
                                            paymentDone,
                                            function(err) {
                                                if (err && err !== 'canceledByUser') {
                                                    $log.error(err);
                                                    DialogService
                                                            .messageDialog({
                                                                title : 'Pagamento',
                                                                message : 'Ocorreu um erro ao processar o pagamento da ordem.  Na próxima sincronização do sistema um administrador será acionado.',
                                                                btnYes : 'OK',
                                                            });
                                                }
                                                main();
                                            });

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
                         * Checks if all coupons in an array are ok (have no
                         * 'err' attribute).
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
                        function evaluateCoupons(processedCoupons) {
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
