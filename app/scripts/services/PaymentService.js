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
        'tnt.utils.array', 'tnt.catalog.payment.entity', 'tnt.catalog.service.coupon'
    ]).service(
            'PaymentService',
            function PaymentService($q, ArrayUtils, Payment, CashPayment, CheckPayment, CreditCardPayment, NoMerchantCreditCardPayment,
                    ExchangePayment, CouponPayment, CouponService, OnCuffPayment) {

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

                // FIXME: shouldn't all methods be renamed to more
                // specific names? E.g.:
                // add -> addPayment, list -> listPayments,
                // clear -> clearPayments?
                //
                this.add = add;
                this.addAll = addAll;
                this.list = list;
                this.read = read;
                this.clear = clear;
                this.clearAllPayments = clearAllPayments;
                this.getReceivables = getReceivables;

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

                    for (var amount in persistedCoupons) {

                        if (persistedCoupons.hasOwnProperty(amount)) {
                            qty = persistedCoupons[amount];

                            // Keeping this check for safety, but there should
                            // not
                            // be coupons with qty 0 in persistedCoupons.
                            if (qty > 0) {
                                for ( var i = 0; i < qty; i += 1) {
                                    couponPromises.push(CouponService.create(entity.id, amount, null).then(function(coupon) {
                                        return coupon;
                                    }, function(err) {
                                        // FIXME: review this code. Not sure what should happen here.
                                        // coupons is not defined
                                        coupons.err = err;
                                        return $q.reject(coupons);
                                    }));
                                }
                            } // if qty > 0
                        } // if hasOwnProperty
                    } // for amount in persistedCoupons

                    this.clearPersistedCoupons();
                    return $q.all(couponPromises);
                };

                this.persistedCoupons = persistedCoupons;
                this.hasPersistedCoupons = hasPersistedCoupons;
                this.persistCouponQuantity = persistCouponQuantity;
                this.clearPersistedCoupons = clearPersistedCoupons;
                this.createCoupons = createCoupons;
            });
}(angular));
