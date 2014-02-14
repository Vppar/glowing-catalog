(function(angular) {
    'use strict';

    var entities = angular.module('tnt.catalog.payment.entity', []);

    /**
     * Generic payment.
     */
    entities.factory('Payment', function Payment() {

        var service = function svc(amount) {

            if (arguments.length != svc.length) {
                throw 'Payment must be initialized with amount';
            }

            this.amount = amount;
        };

        return service;
    });

    /**
     * Cash payment entity.
     */
    entities.factory('CashPayment', function CashPayment(Payment) {

        var service = function svc(amount) {
            ObjectUtils.superInvoke(this, amount);
        };

        ObjectUtils.inherit(service, Payment);

        return service;
    });

    /**
     * Check payment entity.
     */
    entities.factory('CheckPayment', function CheckPayment(Payment) {

        var service = function svc(amount, bank, agency, account, number, duedate) {

            if (arguments.length != svc.length) {
                throw 'CheckPayment must be initialized with all params';
            }

            this.bank = bank;
            this.agency = agency;
            this.account = account;
            this.number = number;
            this.duedate = duedate;

            ObjectUtils.superInvoke(this, amount);

        };

        ObjectUtils.inherit(service, Payment);

        return service;
    });

    /**
     * Credit card payment entity.
     */
    entities.factory('CreditCardPayment', function CreditCardPayment(Payment) {

        var service = function svc(amount, flag, ccNumber, owner, ccDueDate, cvv, cpf, installments, duedate) {

            if (arguments.length != svc.length) {
                throw 'CreditCardPayment must be initialized with all params';
            }

            this.flag = flag;
            this.ccNumber = ccNumber;
            this.owner = owner;
            this.ccDueDate = ccDueDate;
            this.cvv = cvv;
            this.cpf = cpf;
            this.installments = installments;

            ObjectUtils.ro(this, 'flag', this.flag);
            ObjectUtils.ro(this, 'ccNumber', this.ccNumber);
            ObjectUtils.ro(this, 'owner', this.owner);
            ObjectUtils.ro(this, 'ccDueDate', this.ccDueDate);
            ObjectUtils.ro(this, 'cvv', this.cvv);
            ObjectUtils.ro(this, 'cpf', this.cpf);
            ObjectUtils.ro(this, 'installments', this.installments);

            ObjectUtils.superInvoke(this, amount);

        };

        ObjectUtils.inherit(service, Payment);

        return service;
    });

    /**
     * Credit card without merchant payment entity.
     */
    entities.factory('NoMerchantCreditCardPayment', function NoMerchantCreditCardPayment(Payment) {

        var service = function svc(orderId, amount, flag, installments) {

            if (arguments.length != svc.length) {
                throw 'CreditCardPayment must be initialized with all params';
            }

            this.orderId = orderId;
            this.amount = amount;
            this.flag = flag;
            this.installments = installments;

            ObjectUtils.ro(this, 'orderId', this.flag);
            ObjectUtils.ro(this, 'amount', this.flag);
            ObjectUtils.ro(this, 'flag', this.flag);
            ObjectUtils.ro(this, 'installments', this.installments);

            ObjectUtils.superInvoke(this, amount);

        };

        ObjectUtils.inherit(service, Payment);

        return service;
    });

    /**
     * Exchange payment entity.
     */
    entities.factory('ExchangePayment', function ExchangePayment(Payment) {

        var service = function svc(id, productId, qty, price, amount) {
            this.id = id;
            this.productId = productId;
            this.qty = qty;
            this.price = price;

            ObjectUtils.ro(this, 'productId', this.productId);
            ObjectUtils.superInvoke(this, amount);
        };

        ObjectUtils.inherit(service, Payment);

        return service;
    });

    /**
     * Coupon payment entity.
     */
    entities.factory('CouponPayment', function CouponPayment(Payment) {

        var service = function svc(amount) {
            ObjectUtils.superInvoke(this, amount);
        };

        ObjectUtils.inherit(service, Payment);

        return service;
    });

    /**
     * Coupon payment entity.
     */
    entities.factory('OnCuffPayment', function OnCuffPayment(Payment) {

        var service = function svc(amount, dueDate) {
            if (arguments.length != svc.length) {
                throw 'OnCuffPayment must be initialized with all params';
            }
            this.dueDate = dueDate;
            ObjectUtils.ro(this, 'dueDate', this.dueDate);
            ObjectUtils.superInvoke(this, amount);
        };

        ObjectUtils.inherit(service, Payment);

        return service;
    });

    angular.module('tnt.catalog.payment.service', [
        'tnt.utils.array', 'tnt.catalog.payment.entity', 'tnt.catalog.service.coupon', 'tnt.util.log'
    ]).service(
            'PaymentService',
            function PaymentService($location, $q, $log, $filter, ArrayUtils, Payment, CashPayment, CheckPayment, CreditCardPayment,
                    NoMerchantCreditCardPayment, ExchangePayment, CouponPayment, CouponService, OnCuffPayment, OrderService, EntityService,
                    ReceivableService, ProductReturnService, VoucherService, WebSQLDriver, StockKeeper, SMSService) {

                /**
                 * The current payments.
                 */
                var payments = {
                    cash : [],
                    check : [],
                    creditCard : [],
                    noMerchantCc : [],
                    exchange : [],
                    coupon : [],
                    onCuff : []
                };

                var couponsSaved = [];

                var receivables = [
                    'cash', 'check', 'creditCard', 'noMerchantCc', 'onCuff'
                ];

                /**
                 * Payment types association.
                 */
                var types = {
                    cash : CashPayment,
                    check : CheckPayment,
                    creditCard : CreditCardPayment,
                    noMerchantCc : NoMerchantCreditCardPayment,
                    exchange : ExchangePayment,
                    coupon : CouponPayment,
                    onCuff : OnCuffPayment
                };

                /**
                 * Returns the name of the instance of the given payment.
                 * 
                 * @param payment - Payment to find the name.
                 */
                var getTypeName = function getTypeName(payment) {
                    var result = null;
                    for ( var ix in types) {
                        if (payment instanceof types[ix]) {
                            result = ix;
                        }
                    }
                    return result;
                };

                /**
                 * Given a type of a payment returns the list of these payments.
                 * 
                 * @param typeName - Type of the payments that will be returned.
                 * @throws Exception - In case of an unknown payment type.
                 */
                var list = function list(typeName) {
                    var paymentList = payments[typeName];
                    if (!paymentList) {
                        throw 'PaymentService.list: Unknown type of payment, typeName=' + typeName;
                    }
                    return angular.copy(paymentList);
                };

                var getReceivables = function getReceivables() {
                    var result = [];
                    for ( var ix in receivables) {
                        var typedPayments = payments[receivables[ix]];
                        for ( var ix2 in typedPayments) {
                            var payment = angular.copy(typedPayments[ix2]);
                            payment.type = receivables[ix];

                            // FIXME - Remove it, the date should come in the
                            // correct format
                            var duedate = new Date().getTime();
                            if (payment.duedate) {
                                if (angular.isDate(payment.duedate)) {
                                    duedate = payment.duedate.getTime();
                                } else {
                                    duedate = payment.duedate;
                                }
                            }
                            payment.duedate = duedate;

                            result.push(payment);
                        }
                    }
                    return result;
                };

                /**
                 * Given a type of a payment and an id returns a single payment
                 * instance.
                 * 
                 * @param typeName - Type of the payments that will be returned.
                 * @throws Exception - In case of an unknown payment type.
                 */
                var read = function read(typeName, id) {
                    // find the list
                    var paymentList = list(typeName);
                    // find the payment in the list
                    var payment = ArrayUtils.find(paymentList, 'id', id);
                    if (!payment) {
                        throw 'PaymentService.read: Unknown payment instance, id=' + id;
                    }

                    return angular.copy(payment);
                };

                /**
                 * Adds a payment to temporary list of payments.
                 * 
                 * @param payment - The payment to be added.
                 * @throws Exception - Throws an exception when the given
                 *             payment isn't of any known type.
                 */
                var add =
                        function add(payment) {
                            var typeName = getTypeName(payment);
                            if (typeName === null) {
                                throw 'PaymentService.add: The object is not an instance of any known type of payment, Object=' +
                                    JSON.stringify(payment);
                            }

                            // FIXME: should we use a UUID?
                            payment.id = ArrayUtils.generateUUID();
                            payments[typeName].push(angular.copy(payment));
                        };

                /**
                 * Adds a list of payments to the temporary list of payments.
                 */
                var addAll = function addAll(payments) {
                    var len, i;
                    for (i = 0, len = payments.length; i < len; i += 1) {
                        add(payments[i]);
                    }
                };

                /**
                 * Erase all registered payments for the given payment type.
                 */
                var clear = function clear(type) {
                    var paymentsForType = payments[type];
                    if (paymentsForType) {
                        paymentsForType.length = 0;
                    } else {
                        throw 'PaymentService.clear: invalid payment type';
                    }
                };

                /**
                 * Removes all registered payments for all payment types.
                 */
                var clearAllPayments = function clearAll() {
                    for ( var idx in payments) {
                        if (payments.hasOwnProperty(idx)) {
                            clear(idx);
                        }
                    }
                };

                var vouchers = [];
                var giftCards = [];

                /**
                 * Saves the payments and closes the order.
                 */
                function checkout(customer, amount, change) {
                    var promises = [];

                    if (OrderService.hasItems()) {
                        // Save the order
                        var savedOrderPromise = OrderService.save();

                        // Generate receivables
                        var receivablesPromise = savedOrderPromise.then(function(orderUuid) {
                            var receivables = getReceivables();

                            // FIXME - This is a workaround to temporally
                            // resolve the problems with change
                            makeZeroChange(receivables, change);

                            return ReceivableService.bulkRegister(receivables, customer, orderUuid);
                        }, propagateRejectedPromise);

                        // Register product exchange
                        var productsReturnPromise = savedOrderPromise.then(function(orderUuid) {
                            var exchanges = list('exchange');
                            return ProductReturnService.bulkRegister(exchanges, customer, orderUuid);
                        }, propagateRejectedPromise);

                        // Process used vouchers, coupons and gift cards
                        var usedVouchersPromise = savedOrderPromise.then(function(orderUuid) {
                            var coupons = list('coupon');
                            return VoucherService.bulkProcess(coupons, customer, orderUuid);
                        }, propagateRejectedPromise);

                        // Create new vouchers and gift cards
                        vouchers = ArrayUtils.list(OrderService.order.items, 'type', 'voucher');
                        giftCards = ArrayUtils.list(OrderService.order.items, 'type', 'giftCard');

                        var newVouchersPromise =
                                vouchers.length && VoucherService.bulkCreate(vouchers).then(null, propagateRejectedPromise);
                        var newGiftCardsPromise =
                                giftCards.length && VoucherService.bulkCreate(giftCards).then(null, propagateRejectedPromise);

                        promises.push(receivablesPromise);
                        promises.push(productsReturnPromise);
                        promises.push(usedVouchersPromise);
                        promises.push(newVouchersPromise);
                        promises.push(newGiftCardsPromise);

                    }

                    if (hasPersistedCoupons()) {
                        // Generate coupons
                        var savedCouponsPromise = createCoupons(customer).then(evaluateCoupons, propagateRejectedPromise);
                        promises.push(savedCouponsPromise);
                    }

                    // FIXME move this method to OrderService.save()
                    // Reserve items in stock
                    var items = OrderService.order.items;
                    for ( var idx in items) {
                        if (angular.isUndefined(items[idx].type)) {
                            promises.push(StockKeeper.reserve(items[idx].id, items[idx].qty));
                        }
                    }

                    var savedSalePromise = $q.all(promises);

                    function sendVoucherSMS(vouchers) {
                        if (vouchers.length > 0) {
                            for ( var i in vouchers) {
                                SMSService.sendVoucherConfirmation(customer, vouchers[i].amount);
                            }
                        }
                    }

                    function sendCouponsSMS(coupons) {
                        if (coupons.length > 0) {
                            SMSService.sendCouponsConfirmation(customer, (i * coupons[i]), coupons[i]);
                        }
                    }

                    function sendGiftCardSMS(giftCards) {
                        if (giftCards.length > 0) {
                            for ( var i in giftCards) {
                                SMSService.sendGiftCardConfirmation(customer, giftCards[i]);
                            }
                        }
                    }

                    savedSalePromise.then(function() {
                        SMSService.sendPaymentConfirmation(customer, amount);
                        sendVoucherSMS(vouchers);
                        sendCouponsSMS(couponsSaved);
                        sendGiftCardSMS(giftCards);
                    });

                    // clear all
                    return savedSalePromise.then(function() {
                        OrderService.clear();
                        clearAllPayments();
                        clearPersistedCoupons();
                    }, propagateRejectedPromise);
                }

                function makeZeroChange(receivables, change) {
                    if (change > 0) {
                        var done = false;
                        for ( var ix in receivables) {
                            var receivable = receivables[ix];
                            if (receivable.type === 'cash') {
                                $log.debug('PaymentService.makeZeroChange: cash amount=' + receivable.amount);
                                $log.debug('PaymentService.makeZeroChange: change=' + change);

                                receivable.amount = Math.round(100 * (receivable.amount - change)) / 100;

                                $log.debug('PaymentService.makeZeroChange: new cash amount=' + receivable.amount);
                                done = true;
                                break;
                            }
                        }
                        if (!done) {
                            var cash = new CashPayment((-1) * change);
                            cash.type = 'cash';
                            $log.debug('PaymentService.makeZeroChange: creating a negative payment=' + change);
                            receivables.push(cash);
                        }
                    } else if (change < 0) {
                        $log.error('PaymentService.checkout: Something went wrong its impossible to do a' + 'checkout missing amount');
                    }
                }

                /**
                 * Cancel the payment and redirect to the main screen.
                 */
                function cancelPayment(result) {
                    if (!result) {
                        return propagateRejectedPromise(result);
                    }
                    OrderService.clear();
                    clearAllPayments();
                    clearPersistedCoupons();

                    $location.path('/');
                }

                function propagateRejectedPromise(err) {
                    return $q.reject(err);
                }

                this.add = add;
                this.addAll = addAll;
                this.list = list;
                this.read = read;
                this.clear = clear;
                this.clearAllPayments = clearAllPayments;
                this.getReceivables = getReceivables;
                this.checkout = checkout;
                this.cancelPayment = cancelPayment;

                // Coupons //////////////////////////

                // This sections handles coupon persistence inside an order,
                // without creating the coupons themselves until the order
                // is finished and the payment processed.

                var persistedCoupons = {};

                // If persistedCoupons is empty, we don't have coupons.
                // persistCouponQuantity() should ensure that coupons with qty 0
                // are
                // removed from the persistedCoupons object.
                var hasPersistedCoupons = function() {
                    for ( var amount in persistedCoupons) {
                        if (persistedCoupons.hasOwnProperty(amount)) {
                            return true;
                        }
                    }

                    return false;
                };

                var persistCouponQuantity = function persistCouponQuantity(amount, qty) {
                    if (qty < 0) {
                        qty = 0;
                    }

                    if (!qty) {
                        delete persistedCoupons[amount];
                    } else {
                        persistedCoupons[amount] = qty;
                    }
                    couponsSaved = angular.copy(persistedCoupons);
                };

                var clearPersistedCoupons = function clearPersistedCoupons() {
                    for ( var idx in persistedCoupons) {
                        if (persistedCoupons.hasOwnProperty(idx)) {
                            delete persistedCoupons[idx];
                        }
                    }
                };

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
                var createCoupons = function createCoupons(entity) {

                    var qty;
                    var processedCoupons = [];
                    var couponPromises = [];

                    // The total amount of all successfully processed coupons
                    processedCoupons.successAmount = 0;

                    // The total quantity of successfully processed coupons
                    processedCoupons.successQty = 0;

                    for ( var amount in persistedCoupons) {

                        if (persistedCoupons.hasOwnProperty(amount)) {
                            qty = persistedCoupons[amount];

                            // Keeping this check for safety, but there should
                            // not
                            // be coupons with qty 0 in persistedCoupons.
                            if (qty > 0) {
                                for ( var i = 0; i < qty; i += 1) {
                                    couponPromises.push(CouponService.create(entity.uuid, amount, null).then(function(coupon) {
                                        return coupon;
                                    }, function(err) {
                                        // FIXME: review this code. Not sure
                                        // what should happen here.
                                        // coupons is not defined
                                        coupons.err = err;
                                        return $q.reject(coupons);
                                    }));
                                }
                            } // if qty > 0
                        } // if hasOwnProperty
                    } // for amount in persistedCoupons

                    clearPersistedCoupons();
                    return $q.all(couponPromises);
                };

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

                this.persistedCoupons = persistedCoupons;
                this.hasPersistedCoupons = hasPersistedCoupons;
                this.persistCouponQuantity = persistCouponQuantity;
                this.clearPersistedCoupons = clearPersistedCoupons;
                this.createCoupons = createCoupons;
            });
}(angular));
