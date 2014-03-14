(function(angular) {
    'use strict';
    angular.module(
            'tnt.catalog.purchaseOrder.service',
            [
                'tnt.utils.array', 'tnt.catalog.financial.math.service', 'tnt.catalog.report.service', 'tnt.catalog.purchaseOrder',
                'tnt.catalog.filter.sum', 'tnt.catalog.stock.entity', 'tnt.catalog.stock.service', 'tnt.catalog.type.keeper'
            ]).service(
            'PurchaseOrderService',
            [
                '$q',
                '$log',
                '$filter',
                'ArrayUtils',
                'FinancialMathService',
                'ReportService',
                'TypeKeeper',
                'PurchaseOrder',
                'PurchaseOrderKeeper',
                'Stock',
                'StockService',
                function PurchaseOrderService($q, $log, $filter, ArrayUtils, FinancialMathService, ReportService, TypeKeeper,
                        PurchaseOrder, PurchaseOrderKeeper, Stock, StockService) {

                    var _this = this;

                    // ############################################################################################################
                    // Aux methods
                    // ############################################################################################################

                    this.filterReceived = function filterReceived(purchaseOrder) {
                        var result = angular.copy(purchaseOrder);
                        for ( var i = 0; i < result.items.length;) {
                            var item = result.items[i];
                            var productReceivings = ArrayUtils.list(purchaseOrder.itemsReceived, 'productId', item.id);
                            var receivedQty = $filter('sum')(productReceivings, 'qty');
                            item.qty = item.qty - receivedQty;
                            if (item.qty === 0) {
                                result.items.splice(i, 1);
                            } else {
                                i++;
                            }
                        }
                        return result;
                    };

                    this.isValid = function isValid(order) {
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

                    this.register = function register(purchase) {
                        var result = null;
                        var hasErrors = this.isValid(purchase);
                        if (hasErrors.length === 0) {
                            result = PurchaseOrderKeeper.add(new PurchaseOrder(purchase));
                            result.then(function(uuid) {
                                /**
                                 * <pre>
                                 * TODO - Uncomment and correct this section, we need to create a Expense.
                                 * var duedate = new Date();
                                 * var entityId = 0;
                                 * var expense = new Expense(null, new Date(), entityId, result.amount, duedate); 
                                 * expense.documentId = uuid;
                                 * ExpenseService.register(expense);
                                 * </pre>
                                 */
                                return uuid;
                            }, function(err) {
                                $log.error('PurchaseOrderService.register: -Failed to create an purchaseOrder. ', err);
                            });
                        } else {
                            $log.error('PurchaseOrderService.register: -Invalid purchaseOrder. ', hasErrors);
                            result = $q.reject(hasErrors);
                        }

                        return result;
                    };

                    /**
                     * Adds a purchase order to the keeper.
                     * 
                     * @param {object} purchaseOrder - Purchase order to be
                     *            added.
                     * @return {object} result - Promise of add process.
                     */
                    this.add = function add(purchaseOrder) {
                        var result = null;
                        var hasErrors = this.isValid(purchaseOrder);
                        if (hasErrors.length === 0) {
                            result = PurchaseOrderKeeper.add(new PurchaseOrder(purchaseOrder));
                            result.then(function(uuid) {
                                return uuid;
                            }, function(err) {
                                $log.error('PurchaseOrderService.register: -Failed to create an purchaseOrder. ', err);
                            });
                        } else {
                            $log.error('PurchaseOrderService.register: -Invalid purchaseOrder. ', hasErrors);
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
                    this.update = function update(purchaseOrder) {
                        var result = null;
                        var hasErrors = this.isValid(purchaseOrder);
                        if (hasErrors.length === 0) {
                            result = PurchaseOrderKeeper.update(new PurchaseOrder(purchaseOrder));
                            result.then(function() {
                            }, function(err) {
                                $log.error('PurchaseOrderService.update: -Failed to create an purchaseOrder. ', err);
                            });
                        } else {
                            $log.error('PurchaseOrderService.update: -Invalid purchaseOrder. ', hasErrors);
                            result = $q.reject(hasErrors);
                        }

                        return result;
                    };

                    /**
                     * List all PurchaseOrders.
                     */
                    this.list = function list() {
                        var results = null;
                        try {
                            results = PurchaseOrderKeeper.list();
                        } catch (err) {
                            $log.debug('PurchaseOrderService.list: Unable to recover the list of purchaseOrders. ' + 'Err=' + err);
                        }
                        return results;
                    };

                    /**
                     * Read a specific purchaseOrder
                     */
                    this.read =
                            function read(uuid) {
                                var result = null;
                                try {
                                    result = PurchaseOrderKeeper.read(uuid);
                                } catch (err) {
                                    $log.debug('PurchaseOrderService.read: Unable to find an purchaseOrder with the uuid=' + uuid + '. ' +
                                        'Err=' + err);
                                }
                                return result;
                            };

                    // ############################################################################################################
                    // Business methods
                    // ############################################################################################################

                    this.listPendingPurchaseOrders = function listPendingPurchaseOrders() {
                        var purchaseOrders = this.list();
                        var pending = [];

                        for ( var i in purchaseOrders) {
                            if (!purchaseOrders[i].received) {
                                var filteredOrder = this.filterReceived(purchaseOrders[i]);
                                if (filteredOrder.items.length > 0) {
                                    pending.push(filteredOrder);
                                }
                            }
                        }
                        return pending;
                    };

                    this.receive =
                            function receive(uuid, productId, nfeData, receivedQty) {
                                var result = true;
                                var numericProductId = Number(productId);

                                try {
                                    var purchaseOrder = this.read(uuid);
                                    var purchasedProduct = ArrayUtils.find(purchaseOrder.items, 'id', numericProductId);
                                    var receivedProducts = ArrayUtils.list(purchaseOrder.itemsReceived, 'productId', numericProductId);

                                    if (receivedProducts.length > 0) {
                                        var purchasedQty = purchasedProduct.qty;
                                        var histReceivedQty = $filter('sum')(receivedProducts, 'qty');

                                        if ((histReceivedQty + receivedQty) > purchasedQty) {
                                            throw 'The deliver that is being informed is greater than the total ordered';
                                        }
                                    }
                                    result =
                                            PurchaseOrderKeeper.receive(
                                                    uuid, numericProductId, nfeData.nfeNumber, nfeData.order, receivedQty);

                                    result = result.then(function(productId) {
                                        return StockService.add(new Stock(Number(productId), receivedQty, purchasedProduct.cost));
                                    });

                                } catch (err) {
                                    throw 'PurchaseOrderService.receive: Unable to receive the item with id=' + numericProductId +
                                        ' of the purchaseOrder with uuid=' + uuid + '. ' + 'Err=' + err;
                                }
                                return result;
                            };
                    /**
                     * Redeem a purchaseOrder
                     */
                    this.redeem =
                            function redeem(uuid, extNumber) {
                                var result = null;
                                var redeemed = true;
                                try {
                                    var purchaseOrder = this.read(uuid);
                                    for ( var ix in purchaseOrder.items) {
                                        var item = purchaseOrder.items[ix];
                                        var receivedProducts = ArrayUtils.list(purchaseOrder.itemsReceived, 'productId', item.id);
                                        var receivedQty = $filter('sum')(receivedProducts, 'qty', item.id);

                                        if (item.qty !== receivedQty) {
                                            redeemed = false;
                                            break;
                                        }
                                    }
                                    if (redeemed) {
                                        result = PurchaseOrderKeeper.redeem(uuid, extNumber);
                                    } else {
                                        var deferred = $q.defer();
                                        deferred.resolve('PurchaseOrderService.redeem: Purchase order not fully received.');
                                        result = deferred.promise;
                                    }
                                } catch (err) {
                                    $q.reject('PurchaseOrderService.redeem: Unable to redeem the purchaseOrder with uuid=' + uuid + '. ' +
                                        'Err=' + err);
                                }
                                return result;
                            };

                    /**
                     * Cancel a purchaseOrder
                     * 
                     * @param {string} uuid - UUID from the purchase order to be
                     *            cancelled.
                     */
                    this.cancel =
                            function(uuid) {
                                var result = true;
                                try {
                                    result = PurchaseOrderKeeper.cancel(uuid);
                                } catch (err) {
                                    result =
                                            $q.reject('PurchaseOrderService.cancel: Unable to cancel the purchaseOrder with uuid=' + uuid +
                                                '. ' + 'Err=' + err);
                                }
                                return result;
                            };

                    // ############################################################################################################
                    // Report method
                    // ############################################################################################################
                    this.reportPending =
                            function reportPending(filter) {
                                var type = 'pending';
                                var pendingOrders = this.listPendingPurchaseOrders();
                                // kickstart to report
                                var report = {
                                    total : {
                                        amount : 0,
                                        qty : 0,
                                        avgCost : 0
                                    },
                                    sessions : {}
                                };

                                for ( var ix in pendingOrders) {

                                    for ( var ix2 in pendingOrders[ix].items) {
                                        // walk though all inventory items
                                        var reportItem = pendingOrders[ix].items[ix2];

                                        if (pendingOrders[ix].itemsReceived && pendingOrders[ix].itemsReceived.length === 0 ||
                                            ReportService.shouldFilter(filter, reportItem)) {
                                            continue;
                                        }

                                        // augment the reportItem with undefined
                                        // protected reserve property and qty
                                        ReportService.augmentReserveAndQty(type, reportItem, filter);

                                        var session = ReportService.buildSession(report, reportItem);
                                        var line = ReportService.buildLine(session, reportItem);

                                        report.total.qty += reportItem.qty;
                                        report.total.amount += FinancialMathService.currencyMultiply(reportItem.cost, reportItem.qty);

                                        var foundItem = ArrayUtils.find(line.items, 'SKU', reportItem.SKU);
                                        if (foundItem) {
                                            foundItem.qty += reportItem.qty;
                                        } else {
                                            line.items.push(reportItem);
                                        }
                                    }
                                }

                                report.total.avgCost = FinancialMathService.currencyDivide(report.total.amount, report.total.qty);

                                return report;
                            };
                    // ############################################################################################################
                    // Current pending order methods
                    // ############################################################################################################
                    /**
                     * @type Stores the purchase order allowed status.
                     */
                    var statusTypes = TypeKeeper.list('purchaseOrderStatus');
                    /**
                     * @type Stores the current purchase order.
                     */
                    var purchaseOrder = null;
                    /**
                     * @constructor Current purchase order type.
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
                        $log.debug('PurchaseOrderService.createNew: New current order created.');
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

                        var savedPromise = null;
                        if (purchaseOrder.uuid) {
                            savedPromise = this.update(purchaseOrder);
                        } else {
                            savedPromise = this.add(purchaseOrder);
                        }

                        savedPromise.then(function(uiid) {
                            purchaseOrder.uuid = uuid;
                            purchaseOrder.isDirty = false;
                            $log.info('PurchaseOrderService.save: Current purchase order saved.');
                            $log.debug(purchaseOrder);

                            return uuid;
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

                        var canceledPromise = this.cancel(purchaseOrder);

                        canceledPromise.then(function() {
                            this.clearCurrent();
                            $log.info('PurchaseOrderService.cancel: Current purchase order canceled.');
                        });
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
                        var savedPromise = this.saveCurrent();

                        return savedPromise.then(function() {
                            _this.clearCurrent();
                            $log.info('PurchaseOrderService.checkoutCurrent: Checkout done.');
                        });
                    };
                }
            ]);
}(angular));
