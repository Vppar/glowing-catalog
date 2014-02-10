(function(angular) {
    'use strict';

    angular.module('tnt.catalog.purchaseOrder.entity', []).factory('PurchaseOrder', function PurchaseOrder() {

        var service = function svc(uuid, code, date, canceled, customerId, items) {

            var validProperties = [
                'uuid', 'created', 'code', 'date', 'canceled', 'customerId', 'items'
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
                    throw 'PurchaseOrder must be initialized with uuid, code, date, canceled, customerId, items';
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

                var type = 2;
                var currentEventVersion = 1;
                var currentCounter = 0;
                var purchases = [];
                this.handlers = {};

                function getNextId() {
                    return ++currentCounter;
                }

                /**
                 * Registering handlers
                 */
                ObjectUtils.ro(this.handlers, 'purchaseOrderAddV1', function(event) {
                    var eventData = IdentityService.getUUIDData(event.uuid);

                    if (eventData.deviceId === IdentityService.deviceId) {
                        currentCounter = currentCounter >= eventData.id ? currentCounter : eventData.id;
                    }

                    event = new PurchaseOrder(event);
                    purchases.push(event);

                    return event.uuid;
                });

                ObjectUtils.ro(this.handlers, 'purchaseOrderCancelV1', function(event) {
                    var purchaseEntry = ArrayUtils.find(purchases, 'uuid', event.id);
                    if (purchaseEntry) {
                        purchaseEntry.canceled = event.canceled;
                    } else {
                        throw 'Unable to find an PurchaseOrder with uuid=\'' + event.uuid + '\'';
                    }
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
                    var uuidData = IdentityService.getUUIDData(purchaseObj.uuid);

                    // build order code base in its uuid
                    var strDeviceId = IdentityService.leftPad(uuidData.deviceId, 2);
                    var strId = IdentityService.leftPad(uuidData.id, 4);
                    purchaseObj.code = strDeviceId + '-' + strId + '-' + String(now.getFullYear()).substring(2);

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

                this.add = add;
                this.list = list;
                this.read = read;
                this.cancel = cancel;

            });
    angular.module('tnt.catalog.purchaseOrder', [
        'tnt.catalog.purchaseOrder.entity', 'tnt.catalog.purchaseOrder.keeper'
    ]).run(function(PurchaseOrderKeeper) {
        // Warming up OrderKeeper
    });

}(angular));
