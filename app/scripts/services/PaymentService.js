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

        var service = function svc(amount, bank, agency, account, check, expiration) {

            if (arguments.length != svc.length) {
                throw 'CheckPayment must be initialized with all params';
            }

            this.bank = bank;
            this.agency = agency;
            this.account = account;
            this.check = check;
            this.expiration = expiration;

            ObjectUtils.superInvoke(this, amount);

        };

        ObjectUtils.inherit(service, Payment);

        return service;
    });

    /**
     * Credit card payment entity.
     */
    entities.factory('CreditCardPayment', function CreditCardPayment(Payment) {

        var service = function svc(amount, flag, ccNumber, owner, ccDueDate, cvv, cpf, installments) {

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
     * Exchange payment entity.
     */
    entities.factory('ExchangePayment', function ExchangePayment(Payment) {

        var service = function svc(amount) {
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

    angular.module('tnt.catalog.payment.service', [
        'tnt.utils.array', 'tnt.catalog.payment.entity'
    ]).service(
            'PaymentService',
            function PaymentService(ArrayUtils, Payment, CashPayment, CheckPayment, CreditCardPayment, ExchangePayment, CouponPayment) {

                /**
                 * The current payments.
                 */
                var payments = {
                    cash : [],
                    check : [],
                    creditCard : [],
                    exchange : [],
                    coupon : []
                };
                /**
                 * Payment types association.
                 */
                var types = {
                    cash : CashPayment,
                    check : CheckPayment,
                    creditCard : CreditCardPayment,
                    exchange : ExchangePayment,
                    coupon : CouponPayment
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
                            payment.id = payments[typeName].length + 1;
                            payments[typeName].push(payment);
                        };

                /**
                 * Updates the instance of a payment
                 * 
                 * @param payment - The payment to be updated.
                 * @throws Exception - In case of an unknown payment type or
                 *             unknown payment instance.
                 */
                var update = function update(payment) {
                    // find the list
                    var paymentList = payments[getTypeName(payment)];
                    var paymentInstance = ArrayUtils.find(paymentList, 'id', payment.id);
                    if (!paymentInstance) {
                        throw 'PaymentService.update: Unknown payment instance, id=' + id;
                    }

                    angular.extend(paymentInstance, payment);
                };

                /**
                 * Given a payment instance remove it.
                 * 
                 * @param payment - The payment to be removed.
                 * @throws Exception - In case of an unknown payment type or
                 *             unknown payment instance.
                 */
                var remove = function remove(payment) {
                    // find the list
                    var paymentList = payments[getTypeName(payment)];
                    // find the payment in the list
                    var paymentInstance = ArrayUtils.find(paymentList, 'id', payment.id);
                    if (!paymentInstance) {
                        throw 'PaymentService.remove: Unknown payment instance, id=' + payment.id;
                    }
                    // remove
                    paymentList.splice(paymentList.indexOf(paymentInstance), 1);
                };

                /**
                 * Erase all registered payments.
                 */
                var clear = function clear() {
                    for ( var ix in payments) {
                        payments[ix].length = 0;
                    }
                };

                this.add = add;
                this.list = list;
                this.read = read;
                this.update = update;
                this.remove = remove;
                this.clear = clear;
            });
}(angular));