(function(angular) {
    'use strict';
    angular.module('tnt.catalog.order', [
        'tnt.catalog'
    ]).service('OrderService', function OrderService(DataProvider) {
        /**
         * Template of an empty order.
         */
        var orderTemplate = {
            id : undefined,
            code : undefined,
            date : undefined,
            customerId : undefined,
            paymentIds : undefined,
            items : undefined
        };

        /**
         * The current order.
         */
        var order = {};

        /**
         * Creates a brand new order.
         */
        var createOrder = function createOrder() {
            angular.extend(order, orderTemplate);
            order.paymentIds = [];
            order.items = angular.copy(DataProvider.products);
        };

        /**
         * Get the current order and add to the list of orders.
         */
        var save = function save() {
            var payment = angular.copy(DataProvider.currentPayments);
            payment.id = DataProvider.payments.length + 1;
            payment.customerId = order.customerId;
            DataProvider.payments.push(payment);

            // FIXME - Remove this piece of code, this must be done by the
            // server. (Id, date and code)
            order.id = DataProvider.orders.length + 1;
            order.date = new Date();
            order.code = 'mary-' + ('0000' + order.id).slice(-4) + '-' + String(order.date.getFullYear()).slice(-2);

            DataProvider.orders.push(angular.copy(order));

            createOrder();
        };

        /**
         * Starts the service with an empty order
         */
        createOrder();

        /**
         * Exposes the methods to outside world.
         */
        this.order = order;
        this.save = save;
        this.createOrder = createOrder;

    });
}(angular));