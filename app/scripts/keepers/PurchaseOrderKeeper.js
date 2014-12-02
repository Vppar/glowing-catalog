(function(angular) {
    'use strict';

    angular.module('tnt.catalog.purchaseOrder.entity', []).factory(
            'PurchaseOrder',
            function PurchaseOrder() {

                var service =
                        function svc(uuid, created, amount, discount, points, items) {

                            var validProperties =
                                    [
                                        'uuid', 'created', 'updated', 'status', 'amount', 'cost', 'freight', 'discount', 'points', 'received',
                                        'nfeNumber', 'canceled', 'items', 'itemsReceived'
                                    ];
                            ObjectUtils.method(svc, 'isValid', function() {
                                for ( var ix in this) {
                                    var prop = this[ix];
                                    if (!angular.isFunction(prop)) {
                                        if (validProperties.indexOf(ix) === -1) {
                                            throw 'PurchaseOrder: Unexpected property ' + ix;
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
                                this.status = status;
                                this.amount = amount;
                                this.discount = discount;
                                this.points = points;
                                this.items = items;
                            }

                            this.itemsReceived = [];

                            ObjectUtils.ro(this, 'uuid', this.uuid);
                            ObjectUtils.ro(this, 'created', this.created);
                        };

                return service;
            });

    angular.module(
            'tnt.catalog.purchaseOrder.keeper',
            [
                'tnt.utils.array', 'tnt.catalog.purchaseOrder.entity', 'tnt.catalog.journal.entity', 'tnt.catalog.journal.replayer',
                'tnt.catalog.journal.keeper', 'tnt.identity', 'tnt.catalog.type', 'tnt.catalog.keeper'
            ]).service(
            'PurchaseOrderKeeper',
            [
                '$q',
                'ArrayUtils',
                'JournalKeeper',
                'JournalEntry',
                'Replayer',
                'IdentityService',
                'PurchaseOrder',
                'TypeKeeper',
                PurchaseOrderKeeper]).run(function (MasterKeeper) {
                    ObjectUtils.inherit(PurchaseOrderKeeper, MasterKeeper);
                });
                
                function PurchaseOrderKeeper($q, ArrayUtils, JournalKeeper, JournalEntry, Replayer, IdentityService, PurchaseOrder,
                        TypeKeeper) {

                    var type = 6;
                    var currentEventVersion = 2;
                    var currentCounter = 0;
                    var purchases = [];
                    
                    ObjectUtils.superInvoke(this, 'PurchaseOrder', PurchaseOrder, currentEventVersion);

                    var status = TypeKeeper.list('purchaseOrderStatus');

                    var STATUS_STASHED = ArrayUtils.find(status, 'name', 'stashed')['id'];
                    var STATUS_CANCELED = ArrayUtils.find(status, 'name', 'canceled')['id'];
                    var STATUS_CONFIRMED = ArrayUtils.find(status, 'name', 'confirmed')['id'];
                    var STATUS_PARC_REC = ArrayUtils.find(status, 'name', 'partiallyReceived')['id'];
                    var STATUS_RECEIVED = ArrayUtils.find(status, 'name', 'received')['id'];

                    var _this = this;

                    this.handlers = {};

                    function getNextId() {
                        return ++currentCounter;
                    }

                    // ############################################################################################################
                    // Handlers V1
                    // ############################################################################################################

                    // Nuke event for clearing the purchases list
                    ObjectUtils.ro(this.handlers, 'nukePurchasesV1', function() {
                        purchases.length = 0;
                        return true;
                    });

                    ObjectUtils.ro(this.handlers, 'purchaseOrderAddV1', function(event) {
                        // There wasn't update or status fields
                        event.updated = event.created;
                        event.status = STATUS_CONFIRMED;

                        return _this.handlers.purchaseOrderAddV2(event);
                    });

                    ObjectUtils.ro(this.handlers, 'purchaseOrderRedeemV1', function(event) {
                        event.status = STATUS_RECEIVED;
                        event.updated = event.received;

                        return _this.handlers.purchaseOrderReceiveV2(event);
                    });

                    ObjectUtils.ro(this.handlers, 'purchaseOrderReceiveV1', function(event) {
                        event.status = STATUS_PARC_REC;

                        return _this.handlers.purchaseOrderReceiveProductV2(event);
                    });

                    // ############################################################################################################
                    // Handlers V2
                    // ############################################################################################################

                    ObjectUtils.ro(this.handlers, 'purchaseOrderAddV2', function(event) {
                        var eventData = IdentityService.getUUIDData(event.uuid);

                        if (eventData.deviceId === IdentityService.getDeviceId()) {
                            currentCounter = currentCounter >= eventData.id ? currentCounter : eventData.id;
                        }

                        event = new PurchaseOrder(event);
                        purchases.push(event);

                        return event.uuid;
                    });

                    ObjectUtils.ro(this.handlers, 'purchaseOrderUpdateV2', function(event) {
                        var purchaseEntry = ArrayUtils.find(purchases, 'uuid', event.uuid);

                        purchaseEntry.updated = event.updated;
                        purchaseEntry.amount = event.amount;
                        purchaseEntry.discount = event.discount;
                        purchaseEntry.freight = event.freight;
                        purchaseEntry.points = event.points;
                        purchaseEntry.items = event.items;
                        purchaseEntry.cost = event.cost;

                        return event.uuid;
                    });

                    ObjectUtils.ro(this.handlers, 'purchaseOrderChangeStatusV2', function(event) {
                        var purchaseEntry = ArrayUtils.find(purchases, 'uuid', event.uuid);

                        var status = {
                            uuid : event.uuid,
                            from : purchaseEntry.status,
                            to : event.status
                        };

                        purchaseEntry.status = event.status;
                        purchaseEntry.updated = event.updated;

                        return status;
                    });

                    ObjectUtils.ro(this.handlers, 'purchaseOrderCancelV2', function(event) {
                        var purchaseEntry = ArrayUtils.find(purchases, 'uuid', event.uuid);

                        purchaseEntry.updated = event.updated;
                        purchaseEntry.canceled = event.canceled;
                        purchaseEntry.status = event.status;

                        return event.uuid;
                    });

                    ObjectUtils.ro(this.handlers, 'purchaseOrderReceiveV2', function(event) {
                        var purchaseEntry = ArrayUtils.find(purchases, 'uuid', event.uuid);

                        purchaseEntry.updated = event.updated;
                        purchaseEntry.received = event.received;
                        purchaseEntry.status = event.status;
                        purchaseEntry.nfeNumber = event.nfeNumber;

                        return event.uuid;
                    });

                    ObjectUtils.ro(this.handlers, 'purchaseOrderReceiveProductV2', function(event) {
                        var purchaseEntry = ArrayUtils.find(purchases, 'uuid', event.uuid);

                        var receive = {};

                        receive.productId = event.productId;
                        receive.nfeNumber = event.nfeNumber;
                        receive.extNumber = event.extNumber;
                        receive.received = event.received;
                        receive.qty = event.qty;

                        purchaseEntry.itemsReceived.push(receive);
                        purchaseEntry.extNumber = event.extNumber;
                        purchaseEntry.status = event.status;
                        purchaseEntry.updated = event.updated;

                        return receive.productId;
                    });

                    /**
                     * Registering the handlers with the Replayer
                     */
                    Replayer.registerHandlers(this.handlers);

                    // ############################################################################################################
                    // Public methods
                    // ############################################################################################################

                    /**
                     * Adds an purchase order.
                     * 
                     * @param {PurchaseOrder} purchaseOrder - Purchase order to
                     *            be updated.
                     * @return {object} result - Promise that will resolve when
                     *         the add is done.
                     */
                    var add = function add(purchase) {
                        if (!(purchase instanceof PurchaseOrder)) {
                            return $q.reject('Wrong instance to PurchaseOrderKeeper');
                        }
                        var purchaseObj = angular.copy(purchase);

                        var now = new Date().getTime();

                        purchaseObj.created = now;
                        purchaseObj.updated = now;
                        purchaseObj.status = STATUS_STASHED;

                        purchaseObj.uuid = IdentityService.getUUID(type, getNextId());

                        return this.journalize('Add', purchaseObj);
                    };

                    /**
                     * List all orders
                     */
                    var list = function list() {
                        return angular.copy(purchases);
                    };

                    /**
                     * List purchase orders by status.
                     * 
                     * @param {string} statusName - Status name.
                     * @return {array} purchaseOrders - A list of purchase
                     *         orders filtered by status.
                     */
                    var listByStatus = function(statusName) {
                        var selectedStatus = ArrayUtils.find(status, 'name', statusName);

                        if (!selectedStatus) {
                            throw 'PurchaseOrderKeeper.listByStatus: Invalid purchase order status: ' + statusName;
                        }

                        var purchaseOrders = ArrayUtils.list(purchases, 'status', selectedStatus['id']);

                        return angular.copy(purchaseOrders);
                    };

                    /**
                     * Read an order
                     */
                    var read = function read(uuid) {
                        return angular.copy(ArrayUtils.find(purchases, 'uuid', uuid));
                    };

                    /**
                     * Update a purchase order.
                     * 
                     * <pre>
                     * Will only update the following fields:
                     *  - uuid
                     *  - updated
                     *  - amount
                     *  - discount 
                     *  - freight
                     *  - points
                     *  - items
                     * </pre>
                     * 
                     * @param {PurchaseOrder} purchaseOrder - Purchase order to
                     *            be updated.
                     * @return {object} result - Promise that will resolve when
                     *         the update is done.
                     */
                    var update = function update(purchaseOrder) {
                        var recoveredPurchaseOrder = ArrayUtils.find(purchases, 'uuid', purchaseOrder.uuid);

                        if (!recoveredPurchaseOrder) {
                            throw 'Unable to find an PurchaseOrder with uuid=\'' + uuid + '\'';
                        }

                        var updateEv = {
                            uuid : purchaseOrder.uuid,
                            updated : new Date().getTime(),
                            amount : purchaseOrder.amount,
                            discount : purchaseOrder.discount,
                            freight : purchaseOrder.freight,
                            points : purchaseOrder.points,
                            items : purchaseOrder.items,
                            cost : purchaseOrder.cost
                        };

                        return this.journalize('Update', updateEv);
                    };

                    /**
                     * Change the status of a purchase order.
                     * 
                     * @param {string} uuid - Purchase order to be updated.
                     * @param {string} statusName - Purchase order to be
                     *            updated.
                     * @return {object} result - Promise that will resolve when
                     *         the update is done.
                     */
                    var changeStatus = function changeStatus(uuid, statusName) {
                        var recoveredPurchaseOrder = ArrayUtils.find(purchases, 'uuid', uuid);

                        if (!recoveredPurchaseOrder) {
                            throw 'Unable to find an PurchaseOrder with uuid=\'' + uuid + '\'';
                        }

                        var updateEv = {
                            uuid : uuid,
                            status : ArrayUtils.find(status, 'name', statusName)['id'],
                            updated : new Date().getTime()
                        };

                        return this.journalize('ChangeStatus', updateEv);
                    };

                    /**
                     * Redeem an order
                     */
                    var receive = function receive(uuid, nfeNumber) {
                        var purchase = ArrayUtils.find(purchases, 'uuid', uuid);
                        if (!purchase) {
                            throw 'Unable to find an PurchaseOrder with uuid=\'' + uuid + '\'';
                        }

                        var now = new Date().getTime();

                        var redeemEv = {
                            uuid : purchase.uuid,
                            updated : now,
                            status : STATUS_RECEIVED,
                            received : now,
                            nfeNumber : nfeNumber
                        };
                        
                        return this.journalize('Receive', redeemEv);
                    };

                    /**
                     * Cancel an order
                     */
                    var cancel = function cancel(uuid) {
                        var purchase = ArrayUtils.find(purchases, 'uuid', uuid);
                        if (!purchase) {
                            throw 'Unable to find an PurchaseOrder with uuid=\'' + uuid + '\'';
                        }

                        var now = new Date().getTime();

                        var cancelEv = {
                            uuid : purchase.uuid,
                            status : STATUS_CANCELED,
                            updated : now,
                            canceled : new Date().getTime()
                        };

                        return this.journalize('Cancel', cancelEv);
                    };

                    /**
                     * Mark as received an item of the order
                     */
                    var receiveProduct =
                            function receiveProduct(uuid, productId, nfeNumber, extNumber, qty) {
                                var purchase = ArrayUtils.find(purchases, 'uuid', uuid);
                                if (!purchase) {
                                    throw 'Unable to find an PurchaseOrder with uuid=\'' + uuid + '\'';
                                }

                                var item = ArrayUtils.find(purchase.items, 'id', productId);
                                if (!item) {
                                    throw 'Unable to find in PurchaseOrder uuid=\'' + uuid + '\'' + ' an item with id=\'' + id + '\'';
                                }

                                var now = new Date().getTime();

                                var receiveEv = {
                                    uuid : purchase.uuid,
                                    productId : productId,
                                    status : STATUS_PARC_REC,
                                    updated : now,
                                    nfeNumber : nfeNumber,
                                    extNumber : extNumber,
                                    received : now,
                                    qty : qty,
                                };

                                return this.journalize('ReceiveProduct', receiveEv);
                            };

                    this.add = add;
                    this.list = list;
                    this.listByStatus = listByStatus;
                    this.read = read;
                    this.update = update;
                    this.changeStatus = changeStatus;
                    this.cancel = cancel;
                    this.receive = receive;
                    this.receiveProduct = receiveProduct;

                }
        
    angular.module('tnt.catalog.purchaseOrder', [
        'tnt.catalog.purchaseOrder.entity', 'tnt.catalog.purchaseOrder.keeper'
    ]).run([
        'PurchaseOrderKeeper', function(PurchaseOrderKeeper) {
            // Warming up OrderKeeper
        }
    ]);

})(angular);
