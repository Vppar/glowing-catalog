(function(angular) {
    'use strict';
    angular
            .module('tnt.catalog.payment', [
                'tnt.catalog.inventory.entity', 'tnt.catalog.inventory.keeper', 'tnt.catalog.payment.entity', 'tnt.catalog.voucher.service', 'tnt.catalog.misplaced.service'
            ])
            .controller(
                    'PaymentCtrl',
                    function($scope, $filter, $location, $q, $log, ArrayUtils, DataProvider, DialogService, OrderService, PaymentService,
                            SMSService, KeyboardService, InventoryKeeper, CashPayment, EntityService, UserService, Misplacedservice) {

                        UserService.redirectIfIsNotLoggedIn();
                        
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
                        var total = {
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
                                unit : 0,
                                discount : getTotalDiscount(),
                                subTotal : 0,

                                // Returns the average price of the units in the order.
                                getAvgUnitPrice : function () {
                                  return getAverage(this.amount, this.unit);
                                },
                            },
                            change : 0
                        };


                        // Holds the total amount paid in exchanged products.
                        total.paymentsExchange = 0;


                        $scope.total = total;


                        // Set initial subTotal when the controller is loaded
                        updateSubTotal();

                        $scope.$watch('total.order.amount', updateSubTotal);
                        $scope.$watch('total.order.discount', updateSubTotal);
                        $scope.$watch('total.paymentsExchange', updateSubTotal);

                        $scope.$watchCollection('total.payments.exchange', function () {
                          total.paymentsExchange = $filter('sum')(total.payments.exchange, 'amount');
                        });


                        function updateSubTotal() {
                          total.order.subTotal = getSubTotal();
                        }


                        // Returns the difference between the total order amount,
                        // the total discount and the exchanges.
                        function getSubTotal() {
                          var exchanges = total.payments.exchange;
                          var subtotal = total.order.amount - total.order.discount - total.paymentsExchange;
                          return subtotal < 0 ? 0 : subtotal;
                        }


                        function getTotalDiscount() {
                          var totalDiscount = 0;

                          for (var idx in order.items) {
                            totalDiscount += order.items[idx].discount || 0;
                          }

                          return totalDiscount;
                        }


                        function getAverage(amount, count) {
                          return count ? Math.round(100 * (parseFloat(amount) / parseFloat(count))) / 100 : 0;
                        }


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


                        $scope.$watch('total.order.discount', function () {
                          var orderTotal = $scope.total.order.amount;
                          var discountTotal = $scope.total.order.discount;
                          Misplacedservice.distributeDiscount(orderTotal, discountTotal, order.items);
                        });


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
                            dialogService.openDialogChooseCustomer().then(function(uuid) {
                                customer = ArrayUtils.find(EntityService.list(), 'uuid', uuid);
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

                        $scope.selectDiscount = function selectMoneyPayment() {
                            // FIXME - Used to temporally resolve VOPP-210.
                            var delta = new Date().getTime() - $scope.keyboard.status.changed;
                            delta = isNaN(delta) ? 501 : delta;
                            if (!$scope.keyboard.status.active && delta > 500) {
                                $scope.selectPaymentMethod('orderDiscount');
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
                                total.payments.cash = PaymentService.list('cash');
                                total.payments.check = PaymentService.list('check');
                                total.payments.creditCard = PaymentService.list('creditCard');
                                total.payments.exchange = PaymentService.list('exchange');
                                total.payments.coupon = PaymentService.list('coupon');
                                total.payments.onCuff = PaymentService.list('onCuff');

                                if (total.payments.check == 0) {
                                    $scope.hideCheckQtde = true;
                                } else {
                                    $scope.hideCheckQtde = false;
                                }

                                if (total.payments.creditCard == 0) {
                                    $scope.hideCardQtde = true;
                                } else {
                                    $scope.hideCardQtde = false;
                                }

                                if (total.payments.exchange == 0) {
                                    $scope.hideExchangeQtde = true;
                                } else {
                                    $scope.hideExchangeQtde = false;
                                }

                                var totalPayments = 0;
                                for ( var ix in $scope.total.payments) {
                                    // Exchanged products are already discounted when
                                    // when the subtotal is calculated
                                    if (ix === 'exchange') { continue; }

                                    totalPayments += $filter('sum')(total.payments[ix], 'amount');
                                }

                                // Order total
                                var basket = order.items;

                                total.order.amount = $filter('sum')(basket, 'price', 'qty');
                                // Handle non-normalized price/amount field
                                total.order.amount += $filter('sum')(basket, 'amount', 'qty');
                                total.order.unit = $filter('sum')(basket, 'qty');
                                total.order.qty = basket ? basket.length : 0;

                                // Change
                                total.change = Math.round((totalPayments - total.order.subTotal) * 100) / 100;
                            }
                        }

                        $scope.$watch('total.order.subTotal', updateOrderAndPaymentTotal);

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

                        function checkout(value) {
                            var result = null;
                            if (value) {
                                result = PaymentService.checkout(customer, $scope.total.order.amount, $scope.total.change);
                            } else {
                                result = $q.reject();

                            }
                            return result;
                        }

                        /**
                         * Ends of the payment process, return the main screen
                         * and alert the user.s
                         */
                        function paymentDone() {
                            $location.path('/');
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

                            var paidPromise = confirmedPaymentPromise.then(checkout, function() {
                                return $q.reject('canceledByUser');
                            });

                            // Inform the user that the payment is done.
                            paidPromise.then(paymentDone, paymentErr);

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
