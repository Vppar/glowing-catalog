(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.order', [
        'tnt.catalog.service.data'
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
        var createNew = function createNew() {
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

            var savedOrder = angular.copy(order);
            DataProvider.orders.push(savedOrder);

            return savedOrder;
        };

        /**
         * Reset the current order.
         */
        var clear = function clear() {
            order = {};
        };

        var inBasketFilter = function inBasketFilter(item) {
            return Boolean(item.qty);
        };

        /**
         * Exposes the methods to outside world.
         */
        this.order = order;
        this.createNew = createNew;
        this.save = save;
        this.clear = clear;
        this.inBasketFilter = inBasketFilter;

    });
}(angular));