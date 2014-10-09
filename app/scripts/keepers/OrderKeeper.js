(function (angular) {
    'use strict';

    angular
        .module('tnt.catalog.order.entity', [])
        .factory(
            'Order',
            function Order () {

                var service =
                    function svc (uuid, code, date, canceled, customerId, items) {

                        var validProperties =
                            [
                                'uuid',
                                'created',
                                'code',
                                'date',
                                'canceled',
                                'customerId',
                                'updated',
                                'items',
                                'itemDiscount',
                                'orderDiscount'
                            ];

                        ObjectUtils.method(svc, 'isValid', function () {
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
                                throw 'Order must be initialized with uuid, code, date, canceled, customerId, items';
                            }
                        } else {
                            this.uuid = uuid;
                            this.code = code;
                            this.date = date;
                            this.canceled = canceled;
                            this.customerId = customerId;
                            this.items = items;
                        }
                        ObjectUtils.ro(this, 'uuid', this.uuid);
                        ObjectUtils.ro(this, 'code', this.code);
                        ObjectUtils.ro(this, 'date', this.date);
                        ObjectUtils.ro(this, 'customerId', this.customerId);
                    };

                return service;
            });

    angular.module(
        'tnt.catalog.order.keeper',
        [
            'tnt.utils.array',
            'tnt.catalog.order.entity',
            'tnt.catalog.journal.entity',
            'tnt.catalog.journal.replayer',
            'tnt.catalog.journal.keeper',
            'tnt.identity',
            'tnt.catalog.keeper'
        ]).service(
        'OrderKeeper',
        [
            '$q',
            'ArrayUtils',
            'Replayer',
            'IdentityService',
            'Order',
            '$filter',
            '$rootScope',
            OrderKeeper
        ]).run(['MasterKeeper', function (MasterKeeper) {
            ObjectUtils.inherit(OrderKeeper, MasterKeeper);
        }]);

    function OrderKeeper ($q, ArrayUtils, Replayer, IdentityService,
        Order, $filter, $rootScope) {

        var type = 4;
        var currentEventVersion = 1;
        var currentCounter = 0;
        var orders = [];
        this.handlers = {};

        ObjectUtils.superInvoke(this, 'Order', Order, currentEventVersion);

        function getNextId () {
            return ++currentCounter;
        }

        /**
         * Registering handlers
         */
        ObjectUtils.ro(this.handlers, 'orderAddV1', function (event) {
            var eventData = IdentityService.getUUIDData(event.uuid);

            if (eventData.deviceId === IdentityService.getDeviceId()) {
                currentCounter = currentCounter >= eventData.id ? currentCounter : eventData.id;
            }

            event = new Order(event);
            orders.push(event);
            $rootScope.$broadcast('orderAdd');
            return event.uuid;
        });

        ObjectUtils.ro(this.handlers, 'orderCancelV1', function (event) {
            var orderEntry = ArrayUtils.find(orders, 'uuid', event.id);
            if (orderEntry) {
                orderEntry.canceled = event.canceled;
                $rootScope.$broadcast('orderCancel');
            } else {
                throw 'Unable to find an order with uuid=\'' + event.uuid + '\'';
            }
        });

        ObjectUtils.ro(this.handlers, 'orderUpdateV1', function (event) {
            var orderEntry = ArrayUtils.find(orders, 'uuid', event.uuid);
            if (orderEntry) {
                orderEntry.items = event.items;
                orderEntry.updated = event.updated;
                $rootScope.$broadcast('orderUpdate');
            } else {
                throw 'Unable to find an order with uuid=\'' + event.uuid + '\'';
            }
        });

        ObjectUtils.ro(this.handlers, 'orderUpdateItemQtyV1', function (event) {
            var orderEntry = ArrayUtils.find(orders, 'uuid', event.uuid);

            if (orderEntry) {
                for ( var ix in event.items) {
                    // var item = ArrayUtils.find(orderEntry.items, 'id',
                    // event.items[ix].id);
                    // FIXME this workround exists because couse
                    // payment-discount.js set an id property to voucher
                    // and gifts cards.
                    var item = $filter('filter')(orderEntry.items, function (item) {
                        var result = false;
                        if (!item.type && item.id === event.items[ix].id) {
                            result = true;
                        }
                        return result;
                    })[0];

                    if (!item.dQty) {
                        item.dQty = 0;
                    }
                    item.dQty += event.items[ix].dQty;
                }
                $rootScope.$broadcast('orderUpdateItemQty');
            } else {
                throw 'Unable to find an order with uuid=\'' + event.uuid + '\'';
            }
        });

        // Nuke event for clearing the orders list
        ObjectUtils.ro(this.handlers, 'nukeOrdersV1', function () {
            orders.length = 0;
            $rootScope.$broadcast('nukeOrders');
            return true;
        });

        /**
         * Registering the handlers with the Replayer
         */
        Replayer.registerHandlers(this.handlers);

        /**
         * Adds an order
         */

        var add =
            function add (order) {
                if (!(order instanceof Order)) {
                    return $q.reject('Wrong instance to OrderKeeper');
                }
                var orderObj = angular.copy(order);

                var now = new Date();

                orderObj.created = now.getTime();
                orderObj.uuid = IdentityService.getUUID(type, getNextId());
                var uuidData = IdentityService.getUUIDData(orderObj.uuid);

                // build order code base in its uuid
                var strDeviceId = IdentityService.leftPad(uuidData.deviceId, 2);
                var strId = IdentityService.leftPad(uuidData.id, 4);
                orderObj.code =
                    strDeviceId + '-' + strId + '-' + String(now.getFullYear()).substring(2);

                return this.journalize('Add', orderObj);
            };

        /**
         * List all orders
         */
        var list = function list () {
            return angular.copy(orders);
        };

        /**
         * Read an order
         */
        var read = function read (uuid) {
            return angular.copy(ArrayUtils.find(orders, 'uuid', uuid));
        };

        /**
         * Update an order
         */
        var update =
            function update (uuid, items) {
                var order = ArrayUtils.find(orders, 'uuid', uuid);
                if (!order) {
                    throw 'Unable to find an order with uuid=\'' + uuid + '\'';
                }
                var updateEv = {
                    uuid : order.uuid,
                    updated : new Date().getTime(),
                    items : items
                };

                return this.journalize('Update', updateEv);
            };

        /**
         * Update the item qty of an order
         */
        var updateItemQty =
            function (uuid, items) {
                var order = ArrayUtils.find(orders, 'uuid', uuid);
                if (!order) {
                    throw 'Unable to find an order with uuid=\'' + uuid + '\'';
                }
                var updateEv = {
                    uuid : order.uuid,
                    updated : new Date().getTime(),
                    items : items
                };

                return this.journalize('UpdateItemQty', updateEv);
            };

        /**
         * Cancel an order
         */
        var cancel =
            function cancel (uuid) {
                var order = ArrayUtils.find(orders, 'uuid', uuid);
                if (!order) {
                    throw 'Unable to find an order with uuid=\'' + uuid + '\'';
                }
                var cancelEv = {
                    uuid : order.uuid,
                    canceled : new Date().getTime()
                };

                return this.journalize('Cancel', cancelEv);
            };

        this.add = add;
        this.list = list;
        this.read = read;
        this.cancel = cancel;
        this.update = update;
        this.updateItemQty = updateItemQty;

    }

    angular.module('tnt.catalog.order', [
        'tnt.catalog.order.entity', 'tnt.catalog.order.keeper'
    ]).run([
        'OrderKeeper', function (OrderKeeper) {
            // Warming up OrderKeeper
        }
    ]);

}(angular));
