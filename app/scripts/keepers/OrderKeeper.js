(function(angular) {
    'use strict';

    angular.module('tnt.catalog.order.entity', []).factory('Order', function Order() {

        var service = function svc() {
            
            var validProperties = ['id', 'code', 'date', 'canceled', 'customerId', 'paymentIds', 'items'];
            
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

            if (arguments.length != svc.length) {
                if (arguments.length === 1 && angular.isObject(arguments[0])) {
                    svc.prototype.isValid.apply(arguments[0]);
                    ObjectUtils.dataCopy(this, arguments[0]);
                } else {
                    throw 'Receivable must be initialized with id, code, date, canceled, customerId, paymentIds, items';
                }
            } else {
                this.id = id;
                this.code = code;
                this.date = date;
                this.customerId = customerId;
                this.paymentIds = paymentIds;
                this.items = items;
            }
            ObjectUtils.ro(this, 'id', this.id);
            ObjectUtils.ro(this, 'code', this.code);
            ObjectUtils.ro(this, 'date', this.date);
            ObjectUtils.ro(this, 'customerId', this.customerId);
            ObjectUtils.ro(this, 'paymentIds', this.paymentIds);
            ObjectUtils.ro(this, 'items', this.items);
        };

        return service;
    });

    angular.module('tnt.catalog.order.keeper', [
        'tnt.utils.array', 'tnt.catalog.order.entity'
    ]).factory('OrderKeeper', function OrderKeeper(ArrayUtils, Order, JournalKeeper, JournalEntry) {

        var currentEventVersion = 1;
        var orders = [];
        this.handlers = {};

        /**
         * Registering handlers
         */
        ObjectUtils.ro(this.handlers, 'orderAddV1', function(event) {
            var orderEntry = new Order(event);
            orders.push(orderEntry);
        });
        ObjectUtils.ro(this.handlers, 'orderCancelV1', function(event) {
            var orderEntry = ArrayUtils.find(orders, 'id', event.id);

            if (orderEntry) {
                orderEntry.canceled = event.canceled;
            } else {
                throw 'Unable to find a order with id=\'' + event.id + '\'';
            }
        });

        /**
         * Adds an order
         */
        var add = function add(order) {
            if(order instanceof Order){
                order.isValid();
            } else {
                throw "Wrong instance";
            }
            
            order.id = order.length + 1;
            
            var stamp = (new Date()).getTime() / 1000;
            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'orderAdd', currentEventVersion, order);

            // save the journal entry
            JournalKeeper.compose(entry);
        };

        /**
         * List all orders
         */
        var list = function list() {
            return angular.copy(orders);
        };

        /**
         * Read an order
         */
        var read = function read(id) {
            return angular.copy(ArrayUtils.find(orders, 'id', id));
        };

        /**
         * Cancel an order
         */
        var cancel = function cancel(id) {
            var orderEntry = ArrayUtils.find(orders, 'id', id);
            if (!orderEntry) {
                throw 'Unable to find a order with id=\'' + id + '\'';
            }
            var time = (new Date()).getTime();
            var stamp = time / 1000;
            var cancelEv = {
                id : id,
                canceled : time
            };

            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'orderCancelV1', currentEventVersion, cancelEv);

            // save the journal entry
            JournalKeeper.compose(entry);
        };

        this.add = add;
        this.list = list;
        this.read = read;
        this.cancel = cancel;

    });

}(angular));
