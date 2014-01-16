(function(angular) {
    'use strict';

    var entities = angular.module('tnt.catalog.payment.entity', []);

    entities.factory('Payment', function Payment() {

        var service = function svc(amount) {

            if (arguments.length != svc.length) {
                throw 'Payment must be initialized with amount';
            }

            this.amount = amount;
        };

        return service;
    });

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

    angular.module('tnt.catalog.service.payment', [
        'tnt.catalog.filter.findBy', 'tnt.catalog.service.data'
    ]).service('PaymentService', function PaymentService($filter, DataProvider) {
        /**
         * Template of an empty payment.
         */
        var paymentTemplate = {
            id : null,
            datetime : null,
            typeId : null,
            customerId : null,
            orderId : null,
            amount : null,
            data : null
        };

        /**
         * The current payment.
         */
        var payments = [];

        /**
         * Find a payment type id based in the description
         */
        var findPaymentTypeByDescription = function findPaymentTypeByDescription(type) {
            return $filter('findBy')(DataProvider.paymentTypes, 'description', type);
        };

        /**
         * Creates a brand new payment.
         */
        var createNew = function createNew(type) {
            var paymentType = findPaymentTypeByDescription(type);
            var newPayment = angular.copy(paymentTemplate);
            if (payments.length > 0) {
                newPayment.id = payments[payments.length - 1].id + 1;
            } else {
                newPayment.id = 1;
            }
            newPayment.typeId = paymentType.id;

            payments.push(newPayment);

            return newPayment;
        };

        /**
         * Get the current payments and add to the list of orders.
         */
        var save = function save(orderId, customerId) {
            var savedPayment = {};
            var savedPayments = [];
            var baseId = DataProvider.payments.length;

            for ( var idx in payments) {
                var payment = payments[idx];

                payment.id += Number(idx) + baseId;
                payment.datetime = new Date();
                payment.orderId = orderId;
                payment.customerId = customerId;

                savedPayment = angular.copy(payment);
                savedPayments.push(savedPayment);
                DataProvider.payments.push(savedPayment);
            }

            return savedPayments;
        };

        /**
         * Reset the current payments.
         */
        var clear = function clear() {
            payments.length = 0;
        };

        /**
         * Exposes the methods to outside world.
         */
        this.payments = payments;
        this.createNew = createNew;
        this.save = save;
        this.clear = clear;
        this.findPaymentTypeByDescription = findPaymentTypeByDescription;
    });
}(angular));