(function(angular) {
    'use strict';

    var entities = angular.module('tnt.catalog.payment.entity', []);

    /**
     * Generic payment.
     */
    entities.factory('Payment', function Payment() {

        var service = function svc(amount) {

            if (arguments.length !== svc.length) {
                throw 'Payment must be initialized with amount';
            }

            this.amount = amount;
        };

        return service;
    });

    /**
     * Cash payment entity.
     */
    entities.factory('CashPayment', [
        'Payment', function CashPayment(Payment) {

            var service = function svc(amount) {
                ObjectUtils.superInvoke(this, amount);
            };

            ObjectUtils.inherit(service, Payment);

            return service;
        }
    ]);

    /**
     * Check payment entity.
     */
    entities.factory('CheckPayment', [
        'Payment', function CheckPayment(Payment) {

            var service = function svc(uuid, amount, bank, agency, account, number, duedate) {

                // FIXME - type was included for legacy reasons but we aren\'t
                // sure if he is really used on the application. Pls review
                // this.
                var validProperties = [
                    'uuid', 'bank', 'agency', 'account', 'number', 'duedate', 'amount', 'document', 'state', 'type'
                ];

                ObjectUtils.method(svc, 'isValid', function() {
                    for ( var ix in this) {
                        var prop = this[ix];

                        if (!angular.isFunction(prop)) {
                            if (validProperties.indexOf(ix) === -1) {
                                throw 'Unexpected property ' + ix;
                            }
                        }
                    }
                });

                if (arguments.length !== svc.length) {
                    if (arguments.length === 1 && angular.isObject(arguments[0])) {
                        svc.prototype.isValid.apply(arguments[0]);
                        ObjectUtils.dataCopy(this, arguments[0]);
                    } else {
                        throw 'CheckPayment must be initialized with uuid, bank, agency, account, number, duedate and amount';
                    }
                } else {
                    this.uuid = uuid;
                    this.bank = bank;
                    this.agency = agency;
                    this.account = account;
                    this.number = number;
                    this.duedate = duedate;
                    ObjectUtils.superInvoke(this, amount);
                }

                ObjectUtils.ro(this, 'bank', this.bank);
                ObjectUtils.ro(this, 'agency', this.agency);
                ObjectUtils.ro(this, 'account', this.account);
                ObjectUtils.ro(this, 'number', this.number);
                ObjectUtils.ro(this, 'duedate', this.duedate);
                ObjectUtils.ro(this, 'amount', this.amount);
            };

            ObjectUtils.inherit(service, Payment);

            return service;
        }
    ]);

    /**
     * Credit card payment entity.
     */
    entities.factory('CreditCardPayment', [
        'Payment', function CreditCardPayment(Payment) {

            var service = function svc(amount, flag, ccNumber, owner, ccDueDate, cpf, installments, duedate) {

                if (arguments.length !== svc.length) {
                    throw 'CreditCardPayment must be initialized with all params';
                }

                this.flag = flag;
                this.ccNumber = ccNumber;
                this.owner = owner;
                this.ccDueDate = ccDueDate;
                this.cpf = cpf;
                this.installments = installments;

                ObjectUtils.ro(this, 'flag', this.flag);
                ObjectUtils.ro(this, 'ccNumber', this.ccNumber);
                ObjectUtils.ro(this, 'owner', this.owner);
                ObjectUtils.ro(this, 'ccDueDate', this.ccDueDate);
                ObjectUtils.ro(this, 'cpf', this.cpf);
                ObjectUtils.ro(this, 'installments', this.installments);

                ObjectUtils.superInvoke(this, amount);

            };

            ObjectUtils.inherit(service, Payment);

            return service;
        }
    ]);

    /**
     * Credit card without merchant payment entity.
     */
    entities.factory('NoMerchantCreditCardPayment', [
        'Payment', function NoMerchantCreditCardPayment(Payment) {

            var service = function svc(amount, flag, installments, duedate) {

                if (arguments.length !== svc.length) {
                    throw 'CreditCardPayment must be initialized with all params';
                }

                this.flag = flag;
                this.installments = installments;
                this.duedate = duedate;

                ObjectUtils.ro(this, 'flag', this.flag);
                ObjectUtils.ro(this, 'installments', this.installments);
                ObjectUtils.ro(this, 'duedate', this.duedate);

                ObjectUtils.superInvoke(this, amount);

            };

            ObjectUtils.inherit(service, Payment);

            return service;
        }
    ]);

    /**
     * Exchange payment entity.
     */
    entities.factory('ExchangePayment', [
        'Payment', function ExchangePayment(Payment) {

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
        }
    ]);

    /**
     * Coupon payment entity.
     */
    entities.factory('CouponPayment', [
        'Payment', function CouponPayment(Payment) {

            var service = function svc(amount) {
                ObjectUtils.superInvoke(this, amount);
            };

            ObjectUtils.inherit(service, Payment);

            return service;
        }
    ]);

    /**
     * Coupon payment entity.
     */
    entities.factory('OnCuffPayment', [
        'Payment', function OnCuffPayment(Payment) {

            var service = function svc(amount, duedate) {
                if (arguments.length !== svc.length) {
                    throw 'OnCuffPayment must be initialized with all params';
                }
                this.duedate = duedate;
                ObjectUtils.ro(this, 'duedate', this.duedate);
                ObjectUtils.superInvoke(this, amount);
            };

            ObjectUtils.inherit(service, Payment);

            return service;
        }
    ]);

    angular.module('tnt.catalog.payment.service', [
        'tnt.utils.array', 'tnt.catalog.payment.entity', 'tnt.catalog.service.coupon', 'tnt.util.log', 'tnt.catalog.service.book'
    ]).service(
            'PaymentService',
            [
                '$location',
                '$q',
                '$log',
                '$filter',
                'ArrayUtils',
                'Payment',
                'CashPayment',
                'CheckPayment',
                'CreditCardPayment',
                'NoMerchantCreditCardPayment',
                'ExchangePayment',
                'CouponPayment',
                'CouponService',
                'OnCuffPayment',
                'OrderService',
                'EntityService',
                'ReceivableService',
                'ProductReturnService',
                'VoucherService',
                'WebSQLDriver',
                'StockKeeper',
                'SMSService',
                'BookService',
                function PaymentService($location, $q, $log, $filter, ArrayUtils, Payment, CashPayment, CheckPayment, CreditCardPayment,
                        NoMerchantCreditCardPayment, ExchangePayment, CouponPayment, CouponService, OnCuffPayment, OrderService,
                        EntityService, ReceivableService, ProductReturnService, VoucherService, WebSQLDriver, StockKeeper, SMSService,
                        BookService) {

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

                    var vouchers = [];
                    var giftCards = [];

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
                     * Given a type of a payment returns the list of these
                     * payments.
                     * 
                     * @param typeName - Type of the payments that will be
                     *            returned.
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

                                // FIXME - Remove it, the date should come in
                                // the
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
                     * Given a type of a payment and an id returns a single
                     * payment instance.
                     * 
                     * @param typeName - Type of the payments that will be
                     *            returned.
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
                                if (payment.type !== 'check') {
                                    payment.id = ArrayUtils.generateUUID();
                                }
                                payments[typeName].push(angular.copy(payment));
                            };

                    /**
                     * Adds a list of payments to the temporary list of
                     * payments.
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

                    /**
                     * Saves the payments and closes the order.
                     */
                    function checkout(customer, amount, discount, change, smsTotal) {
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

                            promises.push(savedOrderPromise);
                            promises.push(receivablesPromise);
                            promises.push(productsReturnPromise);
                            promises.push(usedVouchersPromise);

                            // Create new vouchers and gift cards
                            vouchers = ArrayUtils.list(OrderService.order.items, 'type', 'voucher');
                            giftCards = ArrayUtils.list(OrderService.order.items, 'type', 'giftCard');

                            if (vouchers.length) {
                                var newVouchersPromise = VoucherService.bulkCreate(vouchers).then(null, propagateRejectedPromise);
                                promises.push(newVouchersPromise);
                            }

                            if (giftCards.length) {
                                var newGiftCardsPromise = VoucherService.bulkCreate(giftCards).then(null, propagateRejectedPromise);
                                promises.push(newGiftCardsPromise);
                            }

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

                        var savedSalePromise = $q.all(promises).then(function(result) {
                            // first result of q.all promise is the order uuid
                            var orderUUID = result[0];
                            var order = OrderService.read(orderUUID);
                            insertBookEntries(order, customer, payments, discount, change);
                        });

                        function sendOrderSMS(customer, amount) {
                            if (amount > 0) {
                                SMSService.sendPaymentConfirmation(customer, amount);
                            }
                        }

                        function sendVoucherSMS(vouchers) {
                            if (vouchers.length > 0) {
                                for ( var i in vouchers) {
                                    SMSService.sendVoucherConfirmation(customer, vouchers[i].amount);
                                }
                            }
                        }

                        function sendCouponsSMS(coupons) {
                            if (coupons) {
                                for ( var i in coupons) {
                                    SMSService.sendCouponConfirmation(customer, (i * coupons[i]), coupons[i]);
                                }
                            }
                        }

                        function sendGiftCardSMS(giftCards) {
                            if (giftCards.length > 0) {
                                for ( var i in giftCards) {
                                    SMSService.sendGiftCardConfirmation(customer, giftCards[i]);
                                    SMSService.sendGiftCardCustomerConfirmation(customer, giftCards[i]);
                                }
                            }
                        }

                        savedSalePromise.then(function() {
                            sendOrderSMS(customer, smsTotal);
                            sendVoucherSMS(vouchers);
                            sendCouponsSMS(persistedCoupons);
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

                    function insertBookEntries(order, customer, payments, discount, change) {
                        var orderUUID = order ? order.uuid : null;
                        var entityUUID = customer.uuid;

                        var bookEntriesPromises = [];
                        if (order && order.items.length > 0) {
                            bookEntriesPromises = insertOrderBookEntries(orderUUID, entityUUID, order.items);
                        }

                        bookEntriesPromises =
                                bookEntriesPromises.concat(insertPaymentBookEntries(orderUUID, entityUUID, payments, discount, change));

                        var exchanges = list('exchange');
                        if (exchanges.length > 0) {
                            bookEntriesPromises =
                                    bookEntriesPromises.concat(insertProductReturnBookEntries(orderUUID, entityUUID, exchanges));
                        }

                        return $q.all(bookEntriesPromises);
                    }

                    function insertOrderBookEntries(orderUUID, entityUUID, orderItems) {
                        var productAmount = 0;
                        var voucherAmount = 0;
                        var giftAmount = 0;

                        for ( var ix in orderItems) {
                            var item = orderItems[ix];
                            if (!item.type) {
                                productAmount += currencyMultiply(item.price ? item.price : 0, item.qty);
                            } else if (item.type === 'voucher') {
                                voucherAmount += currencyMultiply(item.amount, item.qty);
                            } else if (item.type === 'giftCard') {
                                giftAmount += currencyMultiply(item.amount, item.qty);
                            }
                        }
                        var bookEntries = BookService.order(orderUUID, entityUUID, productAmount, voucherAmount, giftAmount);

                        return writeBookEntries(bookEntries);
                    }

                    function insertPaymentBookEntries(orderUUID, entityUUID, payments, discount, change) {
                        var cash = financialRound($filter('sum')(payments.cash, 'amount'));
                        cash = financialRound(cash - change);

                        var check = financialRound($filter('sum')(payments.check, 'amount'));

                        var card = financialRound($filter('sum')(payments.creditCard, 'amount'));
                        card += financialRound($filter('sum')(payments.noMerchantCc, 'amount'));

                        var cuff = financialRound($filter('sum')(payments.onCuff, 'amount'));
                        var voucher = financialRound($filter('sum')(ArrayUtils.list(payments.coupon, 'type', 'voucher'), 'amount'));
                        var gift = financialRound($filter('sum')(ArrayUtils.list(payments.coupon, 'type', 'giftCard'), 'amount'));
                        var coupon = financialRound($filter('sum')(ArrayUtils.list(payments.coupon, 'type', 'coupon'), 'amount'));

                        var bookEntries =
                                BookService.payment(orderUUID, entityUUID, cash, check, card, cuff, voucher, gift, discount, coupon);

                        return writeBookEntries(bookEntries);
                    }

                    function insertProductReturnBookEntries(orderUUID, entityUUID, exchanges) {

                        var productAmount = 0;
                        var productCost = 0;

                        for ( var ix in exchanges) {
                            var item = exchanges[ix];
                            productAmount += currencyMultiply(item.price ? item.price : 0, item.qty);
                            productCost += currencyMultiply(item.cost ? item.cost : 0, item.qty);
                        }

                        if (productCost === 0) {
                            productCost = currencyMultiply(productAmount, 0.75); // 75%
                            // of
                            // amount
                            // value
                        }

                        var bookEntries = BookService.productReturn(orderUUID, entityUUID, productAmount, productCost);

                        return writeBookEntries(bookEntries);
                    }

                    function writeBookEntries(bookEntries) {
                        var bookEntryPromises = [];
                        for ( var ix in bookEntries) {
                            var entry = bookEntries[ix];
                            var entryPromise = BookService.write(entry);
                            bookEntryPromises.push(entryPromise);
                        }
                        return bookEntryPromises;
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
                    // persistCouponQuantity() should ensure that coupons with
                    // qty 0
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

                        // The total amount of all successfully processed
                        // coupons
                        processedCoupons.successAmount = 0;

                        // The total quantity of successfully processed coupons
                        processedCoupons.successQty = 0;

                        for ( var amount in persistedCoupons) {

                            if (persistedCoupons.hasOwnProperty(amount)) {
                                qty = persistedCoupons[amount];

                                // Keeping this check for safety, but there
                                // should
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

                    var currencyMultiply = function currencyMultiply(value1, value2) {
                        return financialRound(Number(value1) * Number(value2));
                    };

                    var financialRound = function financialRound(value) {
                        return Math.round(100 * value) / 100;
                    };

                    this.persistedCoupons = persistedCoupons;
                    this.hasPersistedCoupons = hasPersistedCoupons;
                    this.persistCouponQuantity = persistCouponQuantity;
                    this.clearPersistedCoupons = clearPersistedCoupons;
                    this.createCoupons = createCoupons;

                }
            ]);
}(angular));
