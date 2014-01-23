(function(angular) {
    'use strict';

    angular.module('tnt.catalog.order.entity', []).factory('Order', function Order() {

        var service = function svc() {
        };

        return service;
    });

    angular.module('tnt.catalog.order.keeper', [
        'tnt.utils.array', 'tnt.catalog.order.entity'
    ]).factory('OrderKeeper', function OrderKeeper(ArrayUtils, Order, JournalKeeper, JournalEntry) {

        var orders = [];
        this.handlers = {};

        /**
         * Registering handlers
         */
        ObjectUtils.ro(this.handlers, 'orderAddV1', function(event) {
            // TODO - add an order to orders
        });

        /**
         * Adds an order
         */
        var add = function add() {
            // TODO - do all stuff related to the Journal
        };

        /**
         * List all orders
         */
        var list = function list() {
        };

        /**
         * Read an order
         */
        var read = function read() {
        };

        /**
         * Cancel an order
         */
        var cancel = function cancel() {
            // TODO - do all stuff related to the Journal
        };

        this.add = add;
        this.list = list;
        this.read = read;
        this.cancel = cancel;

    });

}(angular));
