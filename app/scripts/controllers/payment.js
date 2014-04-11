(function (angular) {
    'use strict';
    angular
        .module(
        'tnt.catalog.payment',
        [
            'tnt.catalog.inventory.entity', 'tnt.catalog.inventory.keeper', 'tnt.catalog.payment.entity',
            'tnt.catalog.voucher.service', 'tnt.catalog.misplaced.service', 'tnt.catalog.voucher.keeper',
            'tnt.catalog.service.intent'
        ])
        .controller(
        'PaymentCtrl',
        [
            '$scope',
            '$filter',
            '$location',
            '$q',
            '$log',
            'ArrayUtils',
            'DataProvider',
            'DialogService',
            'OrderService',
            'PaymentService',
            'SMSService',
            'KeyboardService',
            'InventoryKeeper',
            'VoucherKeeper',
            'CashPayment',
            'EntityService',
            'UserService',
            'Misplacedservice',
            'IntentService',
            function ($scope, $filter, $location, $q, $log, ArrayUtils, DataProvider, DialogService, OrderService, PaymentService, SMSService, KeyboardService, InventoryKeeper, VoucherKeeper, CashPayment, EntityService, UserService, Misplacedservice, IntentService) {

                UserService.redirectIfIsNotLoggedIn();

                var bundle = IntentService.getBundle();

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

                $scope.coupon = {
                    sum: 0
                };

                $scope.voucherFilter = function (item) {
                    if (item.type === 'voucher' || item.type === 'giftCard') {
                        return true;
                    } else {
                        return false;
                    }
                };

                $scope.couponFilter = function (item) {
                    if (item.type === 'coupon') {
                        return true;
                    } else {
                        return false;
                    }
                };

                $scope.items = order.items;

                $scope.keyboard = KeyboardService.getKeyboard();

                var Discount = Misplacedservice.discount;

                // Payment variables
                var total = {
                    payments: {
                        cash: [],
                        check: [],
                        creditCard: [],
                        exchange: [],
                        coupon: [],
                        onCuff: []
                    },
                    order: {
                        amount: 0,
                        qty: 0,
                        unit: 0,
                        discount: getOrderDiscount(),
                        subTotal: 0,
                        // This is the total amount WITHOUT products
                        // with
                        // item discounts
                        amountWithoutDiscount: getNonDiscountedTotal(),
                        itemDiscount: getSpecificDiscount(),

                        // Returns the average price of the units in
                        // the
                        // order.
                        getAvgUnitPrice: function () {
                            return getAverage(this.amount, this.unit);
                        }
                    },
                    change: 0,
                    discount: 0
                };

                // Holds the total amount paid in exchanged
                // products.
                total.paymentsExchange = 0;

                $scope.total = total;

                $scope.enableDiscount = true;

                // Set initial subTotal when the controller is
                // loaded
                updateSubTotal();

                function updateSubTotal() {
                    // FIXME: change subTotal to total and
                    // newSubTotal to
                    // subTotal
                    total.order.subTotal = getSubTotal();
                    total.order.newSubTotal = getNewSubTotal();
                }

                // Returns the difference between the total order
                // amount,
                // the total discount and the exchanges.
                function getSubTotal() {
                    var totalDiscount = Discount.getTotalDiscount(order.items);

                    var subtotal = total.order.amount - totalDiscount;
                    return subtotal < 0 ? 0 : subtotal;
                }

                function getNewSubTotal() {
                    var subtotal = total.order.amount - total.order.itemDiscount;
                    return subtotal < 0 ? 0 : subtotal;
                }

                // FIXME Replace calls to this with the Discount
                // method,
                // leaving it this way now because I'm in a hurry!
                // Sorry...
                function getSpecificDiscount() {
                    return Discount.getTotalItemDiscount(order.items);
                }

                $scope.getSpecificDiscount = getSpecificDiscount;

                function getOrderDiscount() {
                    return Discount.getTotalOrderDiscount(order.items);
                }

                function getTotalDiscount() {
                    return Discount.getTotalDiscount(order.items);
                }

                $scope.getTotalDiscount = getTotalDiscount;

                function getAverage(amount, count) {
                    return count ? Math.round(100 * (parseFloat(amount) / parseFloat(count))) / 100 : 0;
                }

                /**
                 * Gets the current cash amount from the cash
                 * payments array.
                 */
                function getCashAmount() {
                    var cash = PaymentService.list('cash')[0];
                    return (cash && cash.amount) || 0;
                }

                /**
                 * Stores the amount paid in cash.
                 */
                    // We need a model for storing the cash amount
                    // because
                    // we
                    // are editing the cash amount directly from the
                    // payment
                    // methods list, as oposed to all other methods.
                $scope.cash = {
                    amount: getCashAmount()
                };

                // Controls which left fragment will be shown
                $scope.selectedPaymentMethod = 'none';

                $scope.showPaymentButtons = true;

                // Define the customer
                var customer = ArrayUtils.find(EntityService.list(), 'uuid', order.customerId);
                $scope.customer = customer;

                function getNonDiscountedTotal() {
                    var total = 0;

                    for (var idx in order.items) {
                        var item = order.items[idx];
                        if (!item.itemDiscount) {
                            total += Discount._getItemTotal(item);
                        }
                    }

                    return total;
                }

                var watcher = {
                    discount: {}
                };

                function enableDiscountWatcher() {
                    watcher.discount = $scope.$watch('total.order.discount', discountWatcher);
                }

                function disableDiscountWatcher() {
                    watcher.discount();
                }

                function discountWatcher(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        disableDiscountWatcher();
                        var discountTotal = $scope.total.order.discount;
                        var newSubTotal = $scope.total.order.newSubTotal;
                        var discountLimit = newSubTotal > 100 ? newSubTotal : 100;

                        discountTotal = discountTotal > discountLimit ? discountLimit : discountTotal;

                        $scope.total.order.discount = discountTotal;

                        var items = [];
                        for (var idx in order.items) {
                            var item = order.items[idx];
                            if (!item.itemDiscount) {
                                items.push(item);
                            }
                        }

                        Discount.distributeOrderDiscount(items, discountTotal);
                        updateSubTotal();
                        enableDiscountWatcher();
                    }
                }

                // Whenever the user changes the quantity of an item
                // from the payment screen
                // check if any of them has an order discount higher
                // than its total value.
                // Item discounts are handled by the add-to-basket
                // dialog, therefore, there's
                // no need to check them here.
                function unitWatcher(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        disableDiscountWatcher();
                        var orderDiscount = 0;
                        for (var idx in order.items) {
                            var item = order.items[idx];
                            var itemTotal = Discount._getItemTotal(item);
                            if (item.orderDiscount && item.orderDiscount > itemTotal) {
                                item.orderDiscount = itemTotal;
                            }

                            orderDiscount += item.orderDiscount || 0;
                        }
                        total.order.discount = orderDiscount;
                        enableDiscountWatcher();
                    }
                }

                $scope.$watch('total.order.unit', unitWatcher);

                enableDiscountWatcher();

                $scope.disabled = setEnableConfirmButton;

                function setEnableConfirmButton() {
                    if ($scope.items.length === 0 && !PaymentService.hasPersistedCoupons()) {

                        return true;
                    } else {
                        return false;
                    }
                }

                // When a product is added on items list, we need to
                // rebuild the
                // uniqueName.
                $scope.$watchCollection('items', function () {

                    // Show SKU or SKU + Option(when possible).
                    for (var idx in order.items) {
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

                $scope.$watch('cash.amount', function () {
                    PaymentService.clear('cash');
                    if (Number($scope.cash.amount) !== 0) {
                        var cash = new CashPayment($scope.cash.amount);
                        cash.duedate = new Date().getTime();
                        PaymentService.add(cash);
                    }
                    updateOrderAndPaymentTotal();
                });

                // Publishing dialog service
                var dialogService = DialogService;
                $scope.dialogService = dialogService;

                $scope.openDialogChooseCustomer = function () {
                    IntentService.putBundle({
                        screen: 'payment'
                    });
                    dialogService.openDialogChooseCustomer().then(function (uuid) {
                        if (uuid) {
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
                            updateCoupons();
                        }
                    });
                };

                // #############################################################################################
                // Screen action functions
                // #############################################################################################

                /**
                 * DEPRECATED
                 *
                 * Confirms the check payments and redirect to the
                 * order items. This will be used by the left
                 * fragments that inherits this scope
                 */
                $scope.confirmPayments = function confirmPayments() {
                    $scope.selectPaymentMethod('none');
                };

                /**
                 * DEPRECATED
                 *
                 * Cancels the check payments keeping the old ones
                 * and redirect to the order items. This will be
                 * used by the left fragments that inherits this
                 * scope, they only
                 */
                $scope.cancelPayments = function cancelPayments() {
                    $scope.selectPaymentMethod('none');
                };

                /**
                 * Select the payment method changing the left
                 * fragment that will be shown.
                 *
                 * @param method - payment method.
                 */
                $scope.selectPaymentMethod = function selectPaymentMethod(method) {
                    updateOrderAndPaymentTotal();
                    $scope.showPaymentButtons = (method === 'none' || method === 'money' || method === 'orderDiscount');
                    $scope.selectedPaymentMethod = method;
                };

                $scope.selectMoneyPayment = function selectMoneyPayment() {
                    // FIXME - Used to temporally resolve VOPP-210.
                    if (getCashAmount() === 0 && $scope.total.change < 0) {
                        $scope.cash.amount = (-1) * angular.copy($scope.total.change);
                    }
                    var delta = new Date().getTime() - $scope.keyboard.status.changed;
                    delta = isNaN(delta) ? 501 : delta;
                    if (!$scope.keyboard.status.active && delta > 500) {
                        $scope.selectPaymentMethod('money');
                    }
                };

                $scope.selectDiscount = function selectDiscount() {
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
                            title: 'Pagamento',
                            message: 'Confirmar a exclusão do Vale Presente?',
                            btnYes: 'Sim',
                            btnNo: 'Não'
                        }).then(function (result) {
                            if (result) {
                                var idx = OrderService.order.items.indexOf(item);
                                OrderService.order.items.splice(idx, 1);
                            }
                            updateOrderAndPaymentTotal();
                        });
                    } else if (item.type === 'voucher') {
                        DialogService.messageDialog({
                            title: 'Pagamento',
                            message: 'Confirmar a exclusão do Vale crédito?',
                            btnYes: 'Sim',
                            btnNo: 'Não'
                        }).then(function (result) {
                            if (result) {
                                var idx = OrderService.order.items.indexOf(item);
                                OrderService.order.items.splice(idx, 1);
                            }
                            updateOrderAndPaymentTotal();
                        });
                    } else if (!item.type) {
                        var product = ArrayUtils.filter(DataProvider.products, {
                            id: item.id
                        })[0];

                        var grid = ArrayUtils.list(InventoryKeeper.read(), 'parent', product.parent);
                        var dialogPromise = null;

                        if (grid.length > 1) {
                            dialogPromise = DialogService.openDialogAddToBasketDetails({
                                id: product.parent
                            });
                        } else {
                            dialogPromise = DialogService.openDialogAddToBasket({
                                id: product.parent
                            });
                        }
                        dialogPromise.then(updateOrderAndPaymentTotal);
                    }
                };

                function updateOrderAndPaymentTotal() {
                    // Calculate the Subtotal
                    if (order.items) {
                        // Payment total
                        total.payments.cash = PaymentService.list('cash');
                        total.payments.check = PaymentService.list('check');

                        var creditCard = PaymentService.list('creditCard');
                        var noMerchantCreditCard = PaymentService.list('noMerchantCc');
                        total.payments.creditCard = creditCard.concat(noMerchantCreditCard);

                        total.payments.exchange = PaymentService.list('exchange');
                        total.payments.coupon = PaymentService.list('coupon');
                        total.payments.onCuff = PaymentService.list('onCuff');

                        if (Number(total.payments.check) === 0) {
                            $scope.hideCheckQtde = true;
                        } else {
                            $scope.hideCheckQtde = false;
                        }

                        if (Number(total.payments.creditCard) === 0) {
                            $scope.hideCardQtde = true;
                        } else {
                            $scope.hideCardQtde = false;
                        }

                        if (Number(total.payments.exchange) === 0) {
                            $scope.hideExchangeQtde = true;
                        } else {
                            $scope.hideExchangeQtde = false;
                        }

                        var totalPayments = 0;
                        for (var ix in $scope.total.payments) {

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

                $scope.forceChangeUpdate = updateOrderAndPaymentTotal;

                $scope.$watch('total.order.subTotal', updateOrderAndPaymentTotal);

                $scope.$watch('total.change', function () {
                    if (Number($scope.total.change) !== 0) {
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
                 * Ends of the payment process, return the main
                 * screen and alert the user.s
                 */
                function paymentDone() {
                    $location.path('/');
                }

                /**
                 * Confirmation SMS alert.
                 */
                function smsAlert(message) {
                    return dialogService.messageDialog({
                        title: 'Pagamento',
                        message: message,
                        btnYes: 'OK'
                    });
                }

                function paymentErr(err) {
                    if (err && err !== 'canceledByUser') {
                        $log.error(err);
                        DialogService
                            .messageDialog({
                                title: 'Pagamento',
                                message: 'Ocorreu um erro ao processar o pagamento da ordem.  Na próxima sincronização do sistema um administrador será acionado.',
                                btnYes: 'OK'
                            });
                    }
                }

                function updateTotalDiscount() {
                    total.discount = total.order.discount + total.order.itemDiscount;
                }

                $scope.$watch('total.order.discount', updateTotalDiscount);
                $scope.$watch('total.order.itemDiscount', updateTotalDiscount);

                $scope.$watch('total.order.amount', updateSubTotal);
                $scope.$watch('total.discount', updateSubTotal);
                $scope.$watch('total.paymentsExchange', updateSubTotal);

                function updateEnableDiscount() {
                    var hasItemsWithoutItemDiscount = false;

                    for (var idx in order.items) {
                        if (!order.items[idx].itemDiscount) {
                            hasItemsWithoutItemDiscount = true;
                        }
                    }
                    $scope.enableDiscount = hasItemsWithoutItemDiscount;
                }

                $scope.$watch('total.order.itemDiscount', updateEnableDiscount);
                $scope.$watch('total.order.unit', updateEnableDiscount);

                $scope.$watchCollection('total.payments.exchange', function () {
                    total.paymentsExchange = $filter('sum')(total.payments.exchange, 'amount');
                });

                function updateDiscountRelatedValues() {
                    total.order.itemDiscount = getSpecificDiscount();
                    total.order.discount = getOrderDiscount();
                }

                function watchItemDiscounts() {
                    for (var idx in order.items) {
                        $scope.$watch('items.' + idx + '.itemDiscount', updateDiscountRelatedValues);
                    }
                }

                $scope.$watch('total.order.discount', function () {
                    $scope.discountInput = total.order.discount;
                });

                $scope.$watchCollection('items', watchItemDiscounts);

                $scope.openOrderDiscountDialog =
                    function () {
                        var dialog = null;

                        if ($scope.enableDiscount) {
                            var nonDiscountedTotal = getNonDiscountedTotal();
                            var items = Discount.getItemsWithoutItemDiscount(order.items);

                            var nonDiscountedTotalString = $filter('currency')(nonDiscountedTotal);

                            var message =
                                'Desconto geral é aplicado somente sobre os produtos sem desconto individual.';

                            var data = {
                                initial: total.order.discount,
                                relative: nonDiscountedTotal,
                                title: 'Desconto',
                                message: message
                            };

                            dialog = DialogService.openDialogNumpad(data).then(function (discount) {
                                discount = discount > nonDiscountedTotal ? nonDiscountedTotal : discount;
                                Discount.distributeOrderDiscount(items, discount);
                                updateDiscountRelatedValues();
                            });
                        } else {
                            dialog =
                                DialogService
                                    .messageDialog({
                                        title: 'Desconto',
                                        message: 'Não é possível aplicar desconto geral no pedido que possui desconto individual em todos os itens.',
                                        btnYes: 'OK'
                                    });
                        }

                        return dialog;
                    };

                // #############################################################################################
                // REVIEWED METHOD - DO NOT put anything here that
                // has not been properly reviewed.
                // #############################################################################################

                // #############################################################################################
                // Local variables
                // #############################################################################################

                // #############################################################################################
                // Local functions
                // #############################################################################################

                /**
                 * Show the payment confirmation dialog.
                 *
                 * @return {Object} result - Returns the promise
                 *         generated by the dialog.
                 */
                function showConfirmPaymentDialog() {
                    var result = dialogService.messageDialog({
                        title: 'Pagamento',
                        message: 'Confirmar o pagamento?',
                        btnYes: 'Sim',
                        btnNo: 'Não'
                    });
                    return result;
                }

                /**
                 * Show the payment canceling dialog.
                 *
                 * @return {Object} result - Returns the promise
                 *         generated by the dialog.
                 */
                function showCancelPaymentDialog() {
                    var result = dialogService.messageDialog({
                        title: 'Cancelar Pedido?',
                        message: 'Deseja cancelar este pedido?',
                        btnYes: 'Sim',
                        btnNo: 'Não'
                    });
                    return result;
                }

                function updateCoupons() {
                    var vouchers = getAvailableCouponArray('voucher');
                    var giftCard = getAvailableCouponArray('giftCard');
                    var coupon = getAvailableCouponArray('coupon');
                    $scope.hasCoupons = vouchers.length > 0 || giftCard.length > 0 || coupon.length > 0;
                }

                function getAvailableCouponArray(type) {
                    var array =
                        $filter('filter')(
                            ArrayUtils.list(VoucherKeeper.list(type), 'entity', order.customerId), function (item) {
                                return (!item.redeemed && !item.canceled);
                            });
                    return array;
                }

                // #############################################################################################
                // Scope varialbles
                // #############################################################################################

                // #############################################################################################
                // Scope functions
                // #############################################################################################

                $scope.confirm = function () {
                    var customer = $scope.customer;
                    var totalOrder = $scope.total.order.amount;
                    var totalDiscont = getTotalDiscount();
                    var totalChange = $scope.total.change;
                    var smsTotal = $scope.total.order.amount;
                    var voucher = ArrayUtils.find(order.items, 'type', 'voucher');
                    if (voucher) {
                        smsTotal -= voucher.amount;
                    }

                    var confirmPaymentIntentPromise = showConfirmPaymentDialog();

                    var confirmedPromise = confirmPaymentIntentPromise.then(function () {
                        return PaymentService.checkout(customer, totalOrder, totalDiscont, totalChange, smsTotal);
                    });

                    // Inform the user that the payment is done.
                    return confirmedPromise.then(paymentDone, paymentErr);
                };

                $scope.cancel = function () {
                    var cancelPaymentIntentPromise = showCancelPaymentDialog();
                    // reconstruct the chain of promises in case of
                    // error or success
                    return cancelPaymentIntentPromise.then(PaymentService.cancelPayment);
                };

                // #############################################################################################
                // Warm up
                // #############################################################################################
                updateCoupons();

                if (bundle && bundle.method) {
                    if (bundle.method === 'voucher') {
                        IntentService.putBundle({
                            tab: 'giftCard'
                        });
                    }
                    $scope.selectPaymentMethod(bundle.method);
                }
            }
        ]);
})(angular);
