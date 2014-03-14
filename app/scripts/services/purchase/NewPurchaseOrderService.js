(function(angular) {
    'use strict';
    angular.module(
            'tnt.catalog.purchase.service',
            [
                'tnt.utils.array', 'tnt.catalog.financial.math.service', 'tnt.catalog.report.service', 'tnt.catalog.purchaseOrder',
                'tnt.catalog.filter.sum', 'tnt.catalog.stock.entity', 'tnt.catalog.stock.service', 'tnt.catalog.type.keeper'
            ]).service(
            'PurchaseOrderService',
            [
                '$q',
                '$log',
                '$filter',
                'ReportService',
                'TypeKeeper',
                'PurchaseOrder',
                'PurchaseOrderKeeper',
                'Stock',
                'StockService',
                function PurchaseOrderService($q, $log, $filter, ReportService, TypeKeeper, PurchaseOrder, PurchaseOrderKeeper, Stock,
                        StockService) {

                    var _this = this;

                    // ############################################################################################################
                    // Aux methods
                    // ############################################################################################################

                    this.isValid = function(order) {
                        var invalidProperty, result = [];

                        // See validation helpers in the end of this file
                        invalidProperty = {
                            items : (angular.isArray(items) && items.length > 0)
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
                            var updateIntentPromise = PurchaseOrderKeeper.update(new PurchaseOrder(purchaseOrder));
                            result = updateIntentPromise.then(function(uuid) {
                                $log.info('PurchaseOrderService.update: Purchase order updated.');
                                $log.debug(uuid);
                                return uuid;
                            }, function(err) {
                                $log.error('PurchaseOrderService.update: Failed to create an purchaseOrder.');
                                $log.debug(err);
                                return $q.reject(hasErrors);
                            });
                        } else {
                            $log.error('PurchaseOrderService.update: Invalid purchaseOrder.', hasErrors);
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
                            result = $q.reject(err);
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
                    var purchaseOrder = null;
                    /**
                     * Current purchase order type.
                     * 
                     * @constructor
                     */
                    function PendingPurchaseOrder() {
                        this.uuid = null;
                        this.amount = 0;
                        this.discount = 0;
                        this.status = statusTypes['pending'];
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
                        this.items.splice(items.indexOf(product), 1);
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
                        purchaseOrder = new PendingPurchaseOrder();
                        $log.info('PurchaseOrderService.createNew: New current order created.');
                        return purchaseOrder;
                    };
                    /**
                     * Clear the current purchase order.
                     */
                    this.clearCurrent = function() {
                        purchaseOrder = null;
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
                        $log.debug(purchaseOrder);

                        var saveIntentPromise = null;
                        if (purchaseOrder.uuid) {
                            saveIntentPromise = this.update(purchaseOrder);
                        } else {
                            saveIntentPromise = this.add(purchaseOrder);
                        }

                        var savedPromise = saveIntentPromise.then(function(uiid) {
                            purchaseOrder.uuid = uuid;
                            purchaseOrder.isDirty = false;

                            $log.info('PurchaseOrderService.save: Current purchase order saved.');
                            $log.debug(purchaseOrder);

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
                        $log.debug(purchaseOrder);

                        var cancelIntentPromise = this.cancel(purchaseOrder);

                        var canceledPromise = cancelIntentPromise.then(function() {
                            _this.clearCurrent();
                            $log.info('PurchaseOrderService.cancel: Current purchase order canceled.');
                        }, function(err) {
                            $log.error('PurchaseOrderService.cancel: Cancel current purchase order failed.');
                            $log.debug(err);
                            return $q.reject(err);
                        });

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
                        $log.debug(purchaseOrder);

                        purchaseOrder.status = statusTypes['confirmed'];
                        var saveIntentPromise = this.saveCurrent();

                        var savedPromise = saveIntentPromise.then(function() {
                            _this.clearCurrent();
                            $log.info('PurchaseOrderService.checkoutCurrent: Checkout done.');
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
