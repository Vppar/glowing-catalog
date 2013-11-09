(function(angular) {
    'use strict';

    angular.module('tnt.catalog.order', [
        'tnt.catalog'
    ]).service('OrderService', function OrderService(DataProvider) {
        /**
         * Template of an empty order.
         */
        var orderTemplate = {
            id : null,
            code : null,
            date : null,
            customerId : null,
            paymentIds : null,
            items : null
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
            order.id = DataProvider.orders.length + 1;
            order.date = new Date();
            order.code = 'mary-' + ('0000' + order.id).slice(-4) + '-' + String(order.date.getFullYear()).slice(-2);
            DataProvider.orders.push(angular.copy(order));

            createOrder();
        };

        var inBasketFilter = function productsInBasketFilter(item) {
            return Boolean(item.qty);
        };

        /**
         * Exposes the methods to outside world.
         */
        this.order = order;
        this.save = save;
        this.createOrder = createOrder;
        this.inBasketFilter = inBasketFilter;

    });
}(angular));