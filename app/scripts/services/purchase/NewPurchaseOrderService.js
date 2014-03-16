(function(angular) {
    'use strict';
    angular.module('tnt.catalog.purchase.service', [
        'tnt.utils.array', 'tnt.catalog.purchaseOrder', 'tnt.catalog.type.keeper'
    ]).service(
            'NewPurchaseOrderService',
            [
                '$q', '$log', '$filter', 'ArrayUtils', 'TypeKeeper', 'PurchaseOrder', 'PurchaseOrderKeeper',
                function NewPurchaseOrderService($q, $log, $filter, ArrayUtils, TypeKeeper, PurchaseOrder, PurchaseOrderKeeper) {

                    var _this = this;

                    // ############################################################################################################
                    // Aux methods
                    // ############################################################################################################

                    this.isValid = function(order) {
                        var invalidProperty, result = [];

                        // See validation helpers in the end of this file
                        invalidProperty = {
                            items : (angular.isArray(order.items) && items.length > 0)
                        };

                        for ( var ix in invalidProperty) {
                            if (invalidProperty.hasOwnProperty(ix)) {
                                if (!invalidProperty[ix]) {
                                    var error = {};
                                    error[ix] = order[ix];
                                    result.push(error);
                                }
                            }
                        }

                        return result;
                    };

                    // ############################################################################################################
                    // CRUD Keeper methods
                    // ############################################################################################################

                    /**
                     * Adds a purchase order to the keeper.
                     * 
                     * @param {object} purchaseOrder - Purchase order to be
                     *            added.
                     * @return {object} result - Promise of add process.
                     */
                    this.create = function(purchaseOrder) {
                        var result = null;
                        var hasErrors = _this.isValid(purchaseOrder);
                        if (hasErrors.length === 0) {
                            try {
                                var createIntentPromise = PurchaseOrderKeeper.add(new PurchaseOrder(purchaseOrder));
                                result = createIntentPromise.then(function(uuid) {
                                    $log.info('PurchaseOrderService.create: Purchase order created.');
                                    $log.debug(uuid);
                                    return uuid;
                                }, function(err) {
                                    $log.error('PurchaseOrderService.create: Failed to create an purchaseOrder.');
                                    $log.debug(err);
                                    return $q.reject(err);
                                });
                            } catch (err) {
                                $log.error('PurchaseOrderService.create: Failed to create an purchaseOrder.');
                                $log.debug(err);
                                result = $q.reject(err);
                            }
                        } else {
                            $log.error('PurchaseOrderService.create: Invalid purchaseOrder.');
                            $log.debug(hasErrors);
                            result = $q.reject(hasErrors);
                        }

                        return result;
                    };

                    /**
                     * Updates a purchase order.
                     * 
                     * @param {object} purchaseOrder - Purchase order to be
                     *            updated.
                     * @return {object} result - Promise of update process.
                     */
                    this.update = function(purchaseOrder) {
                        var result = null;
                        var hasErrors = _this.isValid(purchaseOrder);
                        if (hasErrors.length === 0) {
                            try {
                                var updateIntentPromise = PurchaseOrderKeeper.update(new PurchaseOrder(purchaseOrder));
                                result = updateIntentPromise.then(function(uuid) {
                                    $log.info('PurchaseOrderService.update: Purchase order updated.');
                                    $log.debug(uuid);
                                    return uuid;
                                }, function(err) {
                                    $log.error('PurchaseOrderService.update: Failed to update an purchaseOrder.');
                                    $log.debug(err);
                                    return $q.reject(err);
                                });
                            } catch (err) {
                                $log.error('PurchaseOrderService.update: Failed to update an purchaseOrder.');
                                $log.debug(err);
                                result = $q.reject(err);
                            }
                        } else {
                            $log.error('PurchaseOrderService.update: Invalid purchaseOrder.');
                            $log.debug(hasErrors);
                            result = $q.reject(hasErrors);
                        }

                        return result;
                    };

                    /**
                     * List all PurchaseOrders.
                     */
                    this.list = function() {
                        var results = null;
                        try {
                            results = PurchaseOrderKeeper.list();
                        } catch (err) {
                            $log.error('PurchaseOrderService.list: Unable to recover the list of purchaseOrders.');
                            $log.debug(err);
                        }
                        return results;
                    };

                    /**
                     * Read a specific purchaseOrder
                     * 
                     * @param {string} uuid - Purchase order uuid.
                     */
                    this.read = function(uuid) {
                        var result = null;
                        try {
                            result = PurchaseOrderKeeper.read(uuid);
                        } catch (err) {
                            $log.error('PurchaseOrderService.read: Unable to find an purchaseOrder.');
                            $log.debug(err);
                        }
                        return result;
                    };

                    /**
                     * Cancel a purchaseOrder
                     * 
                     * @param {string} uuid - UUID from the purchase order to be
                     *            cancelled.
                     */
                    this.cancel = function(uuid) {
                        var cancelIntentPromise = PurchaseOrderKeeper.cancel(uuid);
                        var result = cancelIntentPromise.then(function(uuid) {
                            $log.info('PurchaseOrderService.cancel: Purchase order canceled.');
                            $log.debug(uuid);
                            return uuid;
                        }, function(err) {
                            $log.error('PurchaseOrderService.cancel: Unable to cancel the purchaseOrder.');
                            $log.debug(err);
                            return $q.reject(err);
                        });
                        return result;
                    };

                    // ############################################################################################################
                    // Current pending order methods
                    // ############################################################################################################
                    /**
                     * Stores the purchase order allowed status.
                     * 
                     * @type
                     */
                    var statusTypes = TypeKeeper.list('purchaseOrderStatus');
                    /**
                     * Stores the current purchase order.
                     * 
                     * @type
                     */
                    this.purchaseOrder = null;
                    /**
                     * Current purchase order type.
                     * 
                     * @constructor
                     */
                    function PendingPurchaseOrder() {
                        this.uuid = null;
                        this.amount = 0;
                        this.discount = 0;
                        this.status = ArrayUtils.find(statusTypes, 'pending')['id'];
                        this.freight = 0;
                        this.points = 0;
                        this.items = [];
                        this.isDirty = false;
                    }
                    /**
                     * Add a product to current purchase order.
                     * 
                     * @param {object} product - Product to be added.
                     */
                    PendingPurchaseOrder.prototype.add = function(product) {
                        this.items.push(product);
                        this.points += product.points;
                        this.amount += product.amount;
                        this.isDirty = true;
                        $log.debug('PendingPurchaseOrder.add: Product added to current PurchaseOrder.', product);
                    };
                    /**
                     * Remove a product from current purchase order.
                     * 
                     * @param {object} product - Product to be removed.
                     */
                    PendingPurchaseOrder.prototype.remove = function(product) {
                        this.items.splice(this.items.indexOf(product), 1);
                        this.points -= product.points;
                        this.amount -= product.amount;
                        this.isDirty = true;
                        $log.debug('PendingPurchaseOrder.remove: Product removed from current PurchaseOrder.', product);
                    };
                    /**
                     * Creates a new current purchase order.
                     * 
                     * @return {PendingPurchaseOrder} purchaseOrder - The
                     *         current purchase order.
                     */
                    this.createNewCurrent = function() {
                        _this.purchaseOrder = new PendingPurchaseOrder();
                        $log.info('PurchaseOrderService.createNew: New current order created.');
                        return _this.purchaseOrder;
                    };
                    /**
                     * Clear the current purchase order.
                     */
                    this.clearCurrent = function() {
                        _this.purchaseOrder = null;
                        $log.debug('PurchaseOrderService.clear: Current order cleared.');
                    };
                    /**
                     * Save current purchase order as pending.
                     * 
                     * @param {object} savedPromise - Promise that will resolve
                     *            when the purchase order is saved.
                     */
                    this.saveCurrent = function() {
                        $log.info('PurchaseOrderService.save: Saving current purchase order.');
                        $log.debug(_this.purchaseOrder);

                        var saveIntentPromise = null;
                        if (_this.purchaseOrder.uuid) {
                            saveIntentPromise = _this.update(_this.purchaseOrder);
                        } else {
                            saveIntentPromise = _this.create(_this.purchaseOrder);
                        }

                        var savedPromise = saveIntentPromise.then(function(uuid) {
                            _this.purchaseOrder.uuid = uuid;
                            _this.purchaseOrder.isDirty = false;

                            $log.info('PurchaseOrderService.save: Current purchase order saved.');
                            $log.debug(_this.purchaseOrder);

                            return uuid;
                        }, function(err) {
                            $log.error('PurchaseOrderService.save: Save current purchase order failed.');
                            $log.debug(err);
                            return $q.reject(err);
                        });

                        return savedPromise;
                    };
                    /**
                     * Cancel current purchase order.
                     * 
                     * @param {object} canceledPromise - Promise that will
                     *            resolve when the purchase order is canceled.
                     */
                    this.cancelCurrent = function() {
                        $log.info('PurchaseOrderService.cancel: Canceling current purchase order.');
                        $log.debug(_this.purchaseOrder);

                        var canceledPromise = null;

                        if (_this.purchaseOrder.uuid) {
                            var cancelIntentPromise = _this.cancel(_this.purchaseOrder.uuid);

                            canceledPromise = cancelIntentPromise.then(function(uuid) {
                                _this.clearCurrent();
                                $log.info('PurchaseOrderService.cancel: Current purchase order canceled.');

                                return uuid;
                            }, function(err) {
                                $log.error('PurchaseOrderService.cancel: Cancel current purchase order failed.');
                                $log.debug(err);
                                return $q.reject(err);
                            });
                        } else {
                            _this.clearCurrent();

                            var deferred = $q.defer();
                            deferred.resolve('0');
                            canceledPromise = deferred.promise;
                        }

                        return canceledPromise;
                    };
                    /**
                     * Save current purchase order as confirmed.
                     * 
                     * @param {object} savedPromise - Promise that will resolve
                     *            when the purchase order is confirmed.
                     */
                    this.checkoutCurrent = function() {
                        $log.info('PurchaseOrderService.checkoutCurrent: Checkout current purchase order started.');
                        $log.debug(_this.purchaseOrder);

                        _this.purchaseOrder.status = statusTypes['confirmed'];
                        var saveIntentPromise = _this.saveCurrent();
                        // TODO - Create an Expense
                        var savedPromise = saveIntentPromise.then(function(uuid) {
                            _this.clearCurrent();
                            $log.info('PurchaseOrderService.checkoutCurrent: Checkout done.');

                            return uuid;
                        }, function(err) {
                            $log.error('PurchaseOrderService.cancel: Cancel current purchase order failed.');
                            $log.debug(err);
                            return $q.reject(err);
                        });

                        return savedPromise;
                    };
                }
            ]);
})(angular);
