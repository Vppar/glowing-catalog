(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.payment', [
        'tnt.catalog.service.data'
    ]).service('PaymentService', function PaymentService(DataProvider) {
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
         * Creates a brand new payment.
         */
        var createNew = function createNew() {

            var newPayment = angular.copy(paymentTemplate);
            newPayment.id = payments.length + 1;
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
            payments = [];
        };

        /**
         * Exposes the methods to outside world.
         */
        this.payments = payments;
        this.createNew = createNew;
        this.save = save;
        this.clear = clear;
    });
}(angular));