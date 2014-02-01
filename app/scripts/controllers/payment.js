(function(angular) {
    'use strict';
    angular
            .module('tnt.catalog.payment', [
                'tnt.catalog.inventory.entity', 'tnt.catalog.inventory.keeper', 'tnt.catalog.payment.entity', 'tnt.catalog.voucher.service'
            ])
            .controller(
                    'PaymentCtrl',
                    function($scope, $filter, $location, $q, $log, ArrayUtils, DataProvider, DialogService, OrderService, PaymentService,
                            SMSService, KeyboardService, InventoryKeeper, CashPayment, EntityService) {

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
                        var customer = ArrayUtils.find(EntityService.list(), 'uuid', order.customerId);
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
                                customer = ArrayUtils.find(EntityService.list(), 'uuid', order.customerId);
                                $scope.customer = customer;

                                // Propagate customer to order
                                order.customerId = customer.uuid;

                                // Update vouchers with new customer
                                var items = order.items, item, len, i;
                                for (i = 0, len = items.length; i < len; i += 1) {
                                    item = items[i];
                                    if (item.type === 'voucher') {
                                        item.uniqueName = customer.name;
                                        item.entity = customer.uuid;
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
                                
                                if ($scope.total.payments.check == 0) {
                                    $scope.hideCheckQtde = true;
                                } else {
                                    $scope.hideCheckQtde = false;
                                }
                                
                                if ($scope.total.payments.creditCard == 0) {
                                    $scope.hideCardQtde = true;
                                } else {
                                    $scope.hideCardQtde = false;
                                }
                                
                                if ($scope.total.payments.exchange == 0) {
                                    $scope.hideExchangeQtde = true;
                                } else {
                                    $scope.hideExchangeQtde = false;
                                }
                                

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

                        function paymentErr(err) {
                            if (err && err !== 'canceledByUser') {
                                $log.error(err);
                                DialogService
                                        .messageDialog({
                                            title : 'Pagamento',
                                            message : 'Ocorreu um erro ao processar o pagamento da ordem.  Na próxima sincronização do sistema um administrador será acionado.',
                                            btnYes : 'OK',
                                        });
                            }
                        }

                        /**
                         * Main function responsible for chaining the
                         * confirmation and cancel processes.
                         */
                        function main() {
                            // Execute when payment is confirmed.
                            var confirmedPaymentPromise = paymentFactory();

                            // reconstruct the chain of promises in case of
                            // error or success
                            confirmedPaymentPromise.then(main, main);

                            var paidPromise = confirmedPaymentPromise.then(PaymentService.checkout, function() {
                                return $q.reject('canceledByUser');
                            });

                            // Inform the user that the payment is done.
                            paidPromise.then(paymentDone, paymentErr);

                            // Send the alert SMS to the customer.
                            paidPromise.then(sendAlertSMSAttempt);

                            // Cancel payment
                            var canceledPaymentPromise = cancelPaymentFactory();
                            // reconstruct the chain of promises in case of
                            // error or success
                            canceledPaymentPromise.then(main, main);
                            canceledPaymentPromise.then(PaymentService.cancelPayment, main);

                            $scope.selectPaymentMethod('none');
                        }

                        main();
                    });
}(angular));
