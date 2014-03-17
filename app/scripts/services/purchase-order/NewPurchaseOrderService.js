(function(angular) {
    'use strict';
    angular.module('tnt.catalog.purchase.service', [
        'tnt.utils.array', 'tnt.catalog.purchaseOrder', 'tnt.catalog.type.keeper', 'tnt.catalog.financial.math.service'
    ]).service(
            'NewPurchaseOrderService',
            [
                '$q',
                '$log',
                '$filter',
                'ArrayUtils',
                'TypeKeeper',
                'FinancialMathService',
                'PurchaseOrder',
                'PurchaseOrderKeeper',
                function NewPurchaseOrderService($q, $log, $filter, ArrayUtils, TypeKeeper, FinancialMathService, PurchaseOrder,
                        PurchaseOrderKeeper) {

                    // ############################################################################################################
                    // Local variables
                    // ############################################################################################################

                    var _this = this;

                    // ############################################################################################################
                    // Local functions
                    // ############################################################################################################

                    function resolvedPromiseWith(param) {
                        var deferred = $q.defer();
                        deferred.resolve(param);
                        return deferred.promise;
                    }

                    // ############################################################################################################
                    // Aux methods
                    // ############################################################################################################

                    this.isValid = function(order) {
                        var invalidProperty, result = [];

                        // See validation helpers in the end of this file
                        invalidProperty = {
                            items : (angular.isArray(order.items) && order.items.length > 0)
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
                     * Changes the status of purchase order.
                     * 
                     * @param {object} purchaseOrder - Purchase order to be
                     *            updated.
                     * @return {object} result - Promise of update process.
                     */
                    this.changeStatus =
                            function(uuid, statusName) {
                                var result = null;
                                try {
                                    var updateIntentPromise = PurchaseOrderKeeper.changeStatus(uuid, statusName);
                                    result =
                                            updateIntentPromise.then(function(status) {
                                                $log.info('PurchaseOrderService.changeStatus: Purchase order \'' + uuid +
                                                    '\' status changed from \'' + status.from + '\' to \'' + status.to + '\'');
                                                $log.debug(uuid);
                                                return uuid;
                                            }, function(err) {
                                                $log.error('PurchaseOrderService.changeStatus: Failed to change an purchaseOrder.');
                                                $log.debug(uuid, err);
                                                return $q.reject(err);
                                            });
                                } catch (err) {
                                    $log.error('PurchaseOrderService.update: Failed to update an purchaseOrder.');
                                    $log.debug(err);
                                    result = $q.reject(err);
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
                                    $log.debug(purchaseOrder.uuid, err);
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
                     * 
                     * @return {array} - All purchase orders.
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
                     * List confirmed PurchaseOrders.
                     * 
                     * @return {array} - Confirmed purchase orders.
                     */
                    this.listConfirmed = function() {
                        var results = null;
                        try {
                            results = PurchaseOrderKeeper.listByStatus('confirmed');
                        } catch (err) {
                            $log.error('PurchaseOrderService.list: Unable to recover the list of stashed purchaseOrders.');
                            $log.debug(err);
                        }
                        return results;
                    };
                    /**
                     * List stashed PurchaseOrders.
                     * 
                     * @return {array} - Stashed purchase orders.
                     */
                    this.listStashed = function() {
                        var results = null;
                        try {
                            results = PurchaseOrderKeeper.listByStatus('stashed');
                        } catch (err) {
                            $log.error('PurchaseOrderService.list: Unable to recover the list of stashed purchaseOrders.');
                            $log.debug(err);
                        }
                        return results;
                    };

                    /**
                     * Read a specific PurchaseOrder.
                     * 
                     * @param {string} uuid - Purchase order uuid.
                     * @return {PurchaseOrder} - Purchase order with informed
                     *         uuid.
                     */
                    this.read = function(uuid) {
                        var result = null;
                        try {
                            result = PurchaseOrderKeeper.read(uuid);
                        } catch (err) {
                            $log.error('PurchaseOrderService.read: Unable to find an purchaseOrder.');
                            $log.debug(uuid, err);
                        }
                        return result;
                    };

                    /**
                     * Cancel a PurchaseOrder.
                     * 
                     * @param {string} uuid - UUID from the purchase order to be
                     *            cancelled.
                     * @return {object} - Promise with the cancel result.
                     */
                    this.cancel = function(uuid) {
                        var cancelIntentPromise = PurchaseOrderKeeper.cancel(uuid);
                        var result = cancelIntentPromise.then(function(uuid) {
                            $log.info('PurchaseOrderService.cancel: Purchase order canceled.');
                            $log.debug(uuid);
                            return uuid;
                        }, function(err) {
                            $log.error('PurchaseOrderService.cancel: Unable to cancel the purchaseOrder.');
                            $log.debug(uuid, err);
                            return $q.reject(err);
                        });
                        return result;
                    };

                    // ############################################################################################################
                    // Current purchase order methods
                    // ############################################################################################################
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
                    function StashedPurchaseOrder() {
                        this.uuid = null;
                        this.amount = 0;
                        this.discount = 0;
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
                    StashedPurchaseOrder.prototype.add = function(product) {
                        var foundProduct = ArrayUtils.find(this.items, 'id', product.id);

                        var changeProduct = {
                            points : 0,
                            amount : 0
                        };

                        if (foundProduct) {
                            if (foundProduct.qty !== product.qty) {
                                changeProduct.qty = product.qty - foundProduct.qty;

                                changeProduct.points = changeProduct.qty * product.points;
                                changeProduct.amount = FinancialMathService.currencyMultiply(changeProduct.qty, product.cost);

                                foundProduct.qty = product.qty;

                                $log.debug('StashedPurchaseOrder.add: Product update in current PurchaseOrder.', product);

                                this.isDirty = true;
                            } else {
                                $log.debug('StashedPurchaseOrder.add: Nothing to do same qty.', product);
                            }
                        } else {
                            changeProduct.points = product.qty * product.points;
                            changeProduct.amount = FinancialMathService.currencyMultiply(product.qty, product.cost);
                            this.items.push(angular.copy(product));
                            this.isDirty = true;

                            $log.debug('StashedPurchaseOrder.add: Product added to current PurchaseOrder.', product);
                        }
                        this.points += changeProduct.points;
                        this.amount += changeProduct.amount;
                    };
                    /**
                     * Remove a product from current purchase order.
                     * 
                     * @param {object} product - Product to be removed.
                     */
                    StashedPurchaseOrder.prototype.remove =
                            function(product) {
                                var foundProduct = ArrayUtils.find(this.items, 'id', product.id);

                                if (foundProduct) {
                                    this.items.splice(this.items.indexOf(product), 1);
                                    this.points -= (product.qty * product.points);
                                    this.amount =
                                            FinancialMathService.currencySubtract(this.amount, FinancialMathService.currencyMultiply(
                                                    product.qty, product.cost));
                                    this.isDirty = true;
                                    $log.debug('StashedPurchaseOrder.remove: Product removed from current PurchaseOrder.', product);
                                }
                            };
                    /**
                     * Creates a new current purchase order.
                     * 
                     * @return {StashedPurchaseOrder} purchaseOrder - The
                     *         current purchase order.
                     */
                    this.createNewCurrent = function(purchaseOrder) {
                        _this.purchaseOrder = new StashedPurchaseOrder();

                        if (purchaseOrder) {
                            angular.extend(_this.purchaseOrder, purchaseOrder);
                        }

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
                     * @return {object} - Promise with the save result.
                     */
                    this.saveCurrent = function() {
                        $log.info('PurchaseOrderService.save: Saving current purchase order.');
                        $log.debug(_this.purchaseOrder);

                        var isDirty = _this.purchaseOrder.isDirty;
                        var createIntentPromise = null;

                        if (_this.purchaseOrder.uuid) {
                            createIntentPromise = resolvedPromiseWith('0');
                        } else {
                            delete _this.purchaseOrder.isDirty;
                            createIntentPromise = _this.create(_this.purchaseOrder).then(function(uuid) {
                                _this.purchaseOrder.uuid = uuid;
                                return uuid;
                            });
                        }

                        var createdPromise = createIntentPromise.then(function(uuid) {
                            var result = null;
                            if (_this.purchaseOrder.isDirty) {
                                delete _this.purchaseOrder.isDirty;
                                result = _this.update(_this.purchaseOrder);
                            } else {
                                result = resolvedPromiseWith(_this.purchaseOrder.uuid);
                            }
                            return result;
                        });
                        var savedPromise = createdPromise.then(function(uuid) {
                            _this.clearCurrent();

                            $log.info('PurchaseOrderService.save: Current purchase order saved.');
                            $log.debug(_this.purchaseOrder);

                            return uuid;
                        }, function(err) {
                            _this.purchaseOrder.isDirty = isDirty;
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
                     * @return {object} - Promise with the cancelCurrent result.
                     */
                    this.cancelCurrent = function() {
                        $log.info('PurchaseOrderService.cancel: Canceling current purchase order.');
                        $log.debug(_this.purchaseOrder);

                        var canceledPromise = null;

                        if (_this.purchaseOrder.uuid) {
                            var cancelIntentPromise = _this.cancel(_this.purchaseOrder.uuid);

                            canceledPromise = cancelIntentPromise.then(function(uuid) {
                                _this.clearCurrent();
                                $log.info('PurchaseOrderService.cancel: Stashed purchase order canceled.');

                                return uuid;
                            }, function(err) {
                                $log.error('PurchaseOrderService.cancel: Cancel current purchase order failed.');
                                $log.debug(err);
                                return $q.reject(err);
                            });
                        } else {
                            _this.clearCurrent();

                            canceledPromise = resolvedPromiseWith('0');

                            $log.info('PurchaseOrderService.cancel: Current purchase order canceled.');
                        }

                        return canceledPromise;
                    };
                    /**
                     * Save current purchase order as confirmed.
                     * 
                     * @param {object} savedPromise - Promise that will resolve
                     *            when the purchase order is confirmed.
                     * @return {object} - Promise with the checkoutCurrent
                     *         result.
                     */
                    this.checkoutCurrent = function() {
                        $log.info('PurchaseOrderService.checkoutCurrent: Checkout current purchase order started.');
                        $log.debug(_this.purchaseOrder);

                        var savedPromise = _this.saveCurrent();

                        var confirmedPromise = savedPromise.then(function(uuid) {
                            return _this.changeStatus(uuid, 'confirmed');
                        });

                        // TODO - Create an Expense
                        var checkoutPromise = confirmedPromise.then(function(uuid) {
                            $log.info('PurchaseOrderService.checkoutCurrent: Checkout done.');

                            return uuid;
                        }, function(err) {
                            $log.error('PurchaseOrderService.checkoutCurrent: Checkout current purchase order failed.');
                            $log.debug(err);
                            return $q.reject(err);
                        });

                        return checkoutPromise;
                    };
                }
            ]);
})(angular);
