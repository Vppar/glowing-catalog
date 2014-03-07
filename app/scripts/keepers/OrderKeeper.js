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
            'tnt.identity'
        ]).service(
        'OrderKeeper',
        [
            '$q',
            'ArrayUtils',
            'JournalKeeper',
            'JournalEntry',
            'Replayer',
            'IdentityService',
            'Order',
            function OrderKeeper ($q, ArrayUtils, JournalKeeper, JournalEntry, Replayer,
                IdentityService, Order) {

                var type = 4;
                var currentEventVersion = 1;
                var currentCounter = 0;
                var orders = [];
                this.handlers = {};

                function getNextId () {
                    return ++currentCounter;
                }

                /**
                 * Registering handlers
                 */
                ObjectUtils.ro(this.handlers, 'orderAddV1', function (event) {
                    var eventData = IdentityService.getUUIDData(event.uuid);

                    if (eventData.deviceId === IdentityService.getDeviceId()) {
                        currentCounter =
                            currentCounter >= eventData.id ? currentCounter : eventData.id;
                    }

                    event = new Order(event);
                    orders.push(event);

                    return event.uuid;
                });

                ObjectUtils.ro(this.handlers, 'orderCancelV1', function (event) {
                    var orderEntry = ArrayUtils.find(orders, 'uuid', event.id);
                    if (orderEntry) {
                        orderEntry.canceled = event.canceled;
                    } else {
                        throw 'Unable to find an order with uuid=\'' + event.uuid + '\'';
                    }
                });

                ObjectUtils.ro(this.handlers, 'orderUpdateV1', function (event) {
                    var orderEntry = ArrayUtils.find(orders, 'uuid', event.uuid);
                    if (orderEntry) {
                        orderEntry.items = event.items;
                        orderEntry.updated = event.updated;
                    } else {
                        throw 'Unable to find an order with uuid=\'' + event.uuid + '\'';
                    }
                });

                // Nuke event for clearing the orders list
                ObjectUtils.ro(this.handlers, 'nukeOrdersV1', function () {
                    orders.length = 0;
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
                            strDeviceId + '-' + strId + '-' +
                                String(now.getFullYear()).substring(2);

                        var event = new Order(orderObj);

                        // create a new journal entry
                        var entry =
                            new JournalEntry(
                                null,
                                event.created,
                                'orderAdd',
                                currentEventVersion,
                                event);

                        // save the journal entry
                        return JournalKeeper.compose(entry);
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
                        // create a new journal entry
                        var entry =
                            new JournalEntry(
                                null,
                                updateEv.updated,
                                'orderUpdate',
                                currentEventVersion,
                                updateEv);
                        // save the journal entry
                        return JournalKeeper.compose(entry);
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
                        // create a new journal entry
                        var entry =
                            new JournalEntry(
                                null,
                                cancelEv.canceled,
                                'orderCancel',
                                currentEventVersion,
                                cancelEv);

                        // save the journal entry
                        return JournalKeeper.compose(entry);
                    };

                this.add = add;
                this.list = list;
                this.read = read;
                this.cancel = cancel;
                this.update = update;

            }
        ]);
    angular.module('tnt.catalog.order', [
        'tnt.catalog.order.entity', 'tnt.catalog.order.keeper'
    ]).run([
        'OrderKeeper', function (OrderKeeper) {
            // Warming up OrderKeeper
        }
    ]);

}(angular));
