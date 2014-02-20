(function(angular) {
    'use strict';

    angular.module('tnt.catalog.purchaseOrder.entity', []).factory('PurchaseOrder', function PurchaseOrder() {

        var service = function svc(uuid, created, amount, discount, points, items) {

            var validProperties = [
                'uuid', 'created', 'amount', 'freight', 'discount', 'points', 'received', 'nfeNumber', 'canceled', 'items', 'itemsReceived'
            ];
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
                    throw 'PurchaseOrder must be initialized with uuid, created, amount, discount, points, items';
                }
            } else {
                this.uuid = uuid;
                this.created = created;
                this.amount = amount;
                this.discount = discount;
                this.points = points;
                this.items = items;
            }

            this.itemsReceived = [];

            ObjectUtils.ro(this, 'uuid', this.uuid);
            ObjectUtils.ro(this, 'created', this.created);
            ObjectUtils.ro(this, 'amount', this.amount);
            ObjectUtils.ro(this, 'discount', this.discount);
            ObjectUtils.ro(this, 'points', this.points);
            ObjectUtils.ro(this, 'items', this.items);
        };

        return service;
    });

    angular.module(
            'tnt.catalog.purchaseOrder.keeper',
            [
                'tnt.utils.array', 'tnt.catalog.purchaseOrder.entity', 'tnt.catalog.journal.entity', 'tnt.catalog.journal.replayer',
                'tnt.catalog.journal.keeper', 'tnt.identity'
            ]).config(function($provide) {
        $provide.decorator('$q', function($delegate) {
            $delegate.reject = function(reason) {
                var deferred = $delegate.defer();
                deferred.reject(reason);
                return deferred.promise;
            };
            return $delegate;
        });
    }).service(
            'PurchaseOrderKeeper',
            function PurchaseOrderKeeper($q, ArrayUtils, JournalKeeper, JournalEntry, Replayer, IdentityService, PurchaseOrder) {

                var type = 6;
                var currentEventVersion = 1;
                var currentCounter = 0;
                var purchases = [];
                this.handlers = {};

                function getNextId() {
                    return ++currentCounter;
                }


                // Nuke event for clearing the purchases list
                ObjectUtils.ro(this.handlers, 'nukeV1', function() {
                    purchases.length = 0;
                    return true;
                });

                /**
                 * Registering handlers
                 */
                ObjectUtils.ro(this.handlers, 'purchaseOrderAddV1', function(event) {
                    var eventData = IdentityService.getUUIDData(event.uuid);

                    if (eventData.deviceId === IdentityService.getDeviceId()) {
                        currentCounter = currentCounter >= eventData.id ? currentCounter : eventData.id;
                    }

                    event = new PurchaseOrder(event);
                    purchases.push(event);

                    return event.uuid;
                });

                ObjectUtils.ro(this.handlers, 'purchaseOrderCancelV1', function(event) {
                    var purchaseEntry = ArrayUtils.find(purchases, 'uuid', event.uuid);
                    if (purchaseEntry) {
                        purchaseEntry.canceled = event.canceled;
                    } else {
                        throw 'Unable to find an PurchaseOrder with uuid=\'' + event.uuid + '\'';
                    }
                    return event.uuid;
                });

                ObjectUtils.ro(this.handlers, 'purchaseOrderRedeemV1', function(event) {
                    var purchaseEntry = ArrayUtils.find(purchases, 'uuid', event.uuid);
                    if (purchaseEntry) {
                        purchaseEntry.received = event.received;
                        purchaseEntry.nfeNumber = event.nfeNumber;
                    } else {
                        throw 'Unable to find an PurchaseOrder with uuid=\'' + event.uuid + '\'';
                    }

                    return event.uuid;
                });

                ObjectUtils.ro(this.handlers, 'purchaseOrderReceiveV1', function(event) {
                    var purchaseEntry = ArrayUtils.find(purchases, 'uuid', event.uuid);
                    if (!purchaseEntry) {
                        throw 'Unable to find an PurchaseOrder with uuid=\'' + event.uuid + '\'';
                    }

                    var item = ArrayUtils.find(purchaseEntry.items, 'id', event.productId);
                    if (!item) {
                        throw 'Unable to find in PurchaseOrder uuid=\'' + event.uuid + '\'' + ' an item with id=\'' + event.productId +
                            '\'';
                    }

                    var receive = {};
                    receive.productId = event.productId;
                    receive.nfeNumber = event.nfeNumber;
                    receive.extNumber = event.extNumber;
                    receive.received = event.received;
                    receive.qty = event.qty;

                    purchaseEntry.itemsReceived.push(receive);
                    purchaseEntry.extNumber = event.extNumber;

                    return receive.productId;
                });

                /**
                 * Registering the handlers with the Replayer
                 */
                Replayer.registerHandlers(this.handlers);

                /**
                 * Adds an order
                 */
                var add = function add(purchase) {
                    if (!(purchase instanceof PurchaseOrder)) {
                        return $q.reject('Wrong instance to PurchaseOrderKeeper');
                    }
                    var purchaseObj = angular.copy(purchase);

                    var now = new Date();

                    purchaseObj.created = now.getTime();
                    purchaseObj.uuid = IdentityService.getUUID(type, getNextId());

                    var event = new PurchaseOrder(purchaseObj);

                    // create a new journal entry
                    var entry = new JournalEntry(null, event.created, 'purchaseOrderAdd', currentEventVersion, event);

                    // save the journal entry

                    return JournalKeeper.compose(entry);
                };

                /**
                 * List all orders
                 */
                var list = function list() {
                    return angular.copy(purchases);
                };

                /**
                 * Read an order
                 */
                var read = function read(uuid) {
                    return angular.copy(ArrayUtils.find(purchases, 'uuid', uuid));
                };

                /**
                 * Redeem an order
                 */
                var redeem = function redeem(uuid, nfeNumber) {
                    var purchase = ArrayUtils.find(purchases, 'uuid', uuid);
                    if (!purchase) {
                        throw 'Unable to find an PurchaseOrder with uuid=\'' + uuid + '\'';
                    }
                    var redeemEv = {
                        uuid : purchase.uuid,
                        received : new Date().getTime(),
                        nfeNumber : nfeNumber
                    };
                    // create a new journal entry
                    var entry = new JournalEntry(null, redeemEv.received, 'purchaseOrderRedeem', currentEventVersion, redeemEv);

                    // save the journal entry
                    return JournalKeeper.compose(entry);
                };

                /**
                 * Cancel an order
                 */
                var cancel = function cancel(uuid) {
                    var purchase = ArrayUtils.find(purchases, 'uuid', uuid);
                    if (!purchase) {
                        throw 'Unable to find an PurchaseOrder with uuid=\'' + uuid + '\'';
                    }
                    var cancelEv = {
                        uuid : purchase.uuid,
                        canceled : new Date().getTime()
                    };
                    // create a new journal entry
                    var entry = new JournalEntry(null, cancelEv.canceled, 'purchaseOrderCancel', currentEventVersion, cancelEv);

                    // save the journal entry
                    return JournalKeeper.compose(entry);
                };

                /**
                 * Mark as received an item of the order
                 */
                var receive = function receive(uuid, productId, nfeNumber, extNumber, qty) {
                    var purchase = ArrayUtils.find(purchases, 'uuid', uuid);
                    if (!purchase) {
                        throw 'Unable to find an PurchaseOrder with uuid=\'' + uuid + '\'';
                    }

                    var item = ArrayUtils.find(purchase.items, 'id', productId);
                    if (!item) {
                        throw 'Unable to find in PurchaseOrder uuid=\'' + uuid + '\'' + ' an item with id=\'' + id + '\'';
                    }

                    var receiveEv = {
                        uuid : purchase.uuid,
                        productId : productId,
                        nfeNumber : nfeNumber,
                        extNumber : extNumber,
                        received : new Date().getTime(),
                        qty : qty,
                    };

                    // create a new journal entry
                    var entry = new JournalEntry(null, receiveEv.received, 'purchaseOrderReceive', currentEventVersion, receiveEv);

                    // save the journal entry
                    return JournalKeeper.compose(entry);
                };

                this.add = add;
                this.list = list;
                this.read = read;
                this.cancel = cancel;
                this.redeem = redeem;
                this.receive = receive;

            });
    angular.module('tnt.catalog.purchaseOrder', [
        'tnt.catalog.purchaseOrder.entity', 'tnt.catalog.purchaseOrder.keeper'
    ]).run(function(PurchaseOrderKeeper) {
        // Warming up OrderKeeper
    });

}(angular));
