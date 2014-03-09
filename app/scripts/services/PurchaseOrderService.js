(function (angular) {
    'use strict';
    angular
        .module(
            'tnt.catalog.purchaseOrder.service',
            [
                'tnt.utils.array',
                'tnt.catalog.financial.math.service',
                'tnt.catalog.report.service',
                'tnt.catalog.purchaseOrder',
                'tnt.catalog.filter.sum',
                'tnt.catalog.stock.entity',
                'tnt.catalog.stock.service'
            ])
        .service(
            'PurchaseOrderService',
            [
                '$q',
                '$log',
                '$filter',
                'ArrayUtils',
                'FinancialMathService',
                'ReportService',
                'PurchaseOrder',
                'PurchaseOrderKeeper',
                'Stock',
                'StockService',
                function PurchaseOrderService ($q, $log, $filter, ArrayUtils, FinancialMathService,
                    ReportService, PurchaseOrder, PurchaseOrderKeeper, Stock, StockService) {

                    this.isValid = function isValid (order) {
                        var invalidProperty, result = [];

                        // See validation helpers in the end of this file
                        invalidProperty = {
                            items : areValidItems(order.items)
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

                    /**
                     * register
                     */
                    this.register =
                        function register (purchase) {
                            var result = null;
                            var hasErrors = this.isValid(purchase);
                            if (hasErrors.length === 0) {
                                result = PurchaseOrderKeeper.add(new PurchaseOrder(purchase));
                                result
                                    .then(
                                        function (uuid) {
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
                                        },
                                        function (err) {
                                            $log
                                                .error(
                                                    'PurchaseOrderService.register: -Failed to create an purchaseOrder. ',
                                                    err);
                                        });
                            } else {
                                $log.error(
                                    'PurchaseOrderService.register: -Invalid purchaseOrder. ',
                                    hasErrors);
                                result = $q.reject(hasErrors);
                            }

                            return result;
                        };

                    /**
                     * List all PurchaseOrders.
                     */
                    this.list =
                        function list () {
                            var results = null;
                            try {
                                results = PurchaseOrderKeeper.list();
                            } catch (err) {
                                $log
                                    .debug('PurchaseOrderService.list: Unable to recover the list of purchaseOrders. ' +
                                        'Err=' + err);
                            }
                            return results;
                        };

                    /**
                     * Read a specific purchaseOrder
                     */
                    this.read =
                        function read (uuid) {
                            var result = null;
                            try {
                                result = PurchaseOrderKeeper.read(uuid);
                            } catch (err) {
                                $log
                                    .debug('PurchaseOrderService.read: Unable to find an purchaseOrder with the uuid=' +
                                        uuid + '. ' + 'Err=' + err);
                            }
                            return result;
                        };

                    this.receive =
                        function receive (uuid, productId, nfeData, receivedQty) {
                            var result = true;
                            var numericProductId = Number(productId);
                            try {
                                var purchaseOrder = this.read(uuid);
                                var purchasedProduct =
                                    ArrayUtils.find(purchaseOrder.items, 'id', numericProductId);
                                var receivedProducts =
                                    ArrayUtils.list(
                                        purchaseOrder.itemsReceived,
                                        'productId',
                                        numericProductId);

                                if (receivedProducts.length > 0) {
                                    var purchasedQty = purchasedProduct.qty;
                                    var histReceivedQty = $filter('sum')(receivedProducts, 'qty');

                                    if ((histReceivedQty + receivedQty) > purchasedQty) {
                                        throw 'The deliver that is being informed is greater than the total ordered';
                                    }
                                }
                                result =
                                    PurchaseOrderKeeper.receive(
                                        uuid,
                                        numericProductId,
                                        nfeData.nfeNumber,
                                        nfeData.order,
                                        receivedQty);

                                result =
                                    result.then(function (productId) {
                                        return StockService.add(new Stock(
                                            Number(productId),
                                            receivedQty,
                                            purchasedProduct.cost));
                                    });

                            } catch (err) {
                                throw 'PurchaseOrderService.receive: Unable to receive the item with id=' +
                                    numericProductId +
                                    ' of the purchaseOrder with uuid=' +
                                    uuid +
                                    '. ' + 'Err=' + err;
                            }
                            return result;
                        };

                    this.filterReceived =
                        function filterReceived (purchaseOrder) {
                            var result = angular.copy(purchaseOrder);
                            for ( var i = 0; i < result.items.length;) {

                                var item = result.items[i];
                                var productReceivings =
                                    ArrayUtils.list(
                                        purchaseOrder.itemsReceived,
                                        'productId',
                                        item.id);
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

                    this.listPendingPurchaseOrders = function listPendingPurchaseOrders () {
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

                    this.reportPending =
                        function reportPending (filter) {
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

                                    if (pendingOrders[ix].itemsReceived &&
                                        pendingOrders[ix].itemsReceived.length === 0 ||
                                        ReportService.shouldFilter(filter, reportItem)) {
                                        console.log('filtered', pendingOrders[ix].items[ix2]);
                                        continue;
                                    }

                                    // augment the reportItem with undefined
                                    // protected reserve property and qty
                                    ReportService.augmentReserveAndQty(type, reportItem, filter);

                                    var session = ReportService.buildSession(report, reportItem);
                                    var line = ReportService.buildLine(session, reportItem);

                                    report.total.qty += reportItem.qty;
                                    report.total.amount +=
                                        FinancialMathService.currencyMultiply(
                                            reportItem.cost,
                                            reportItem.qty);

                                    var foundItem =
                                        ArrayUtils.find(line.items, 'SKU', reportItem.SKU);
                                    if (foundItem) {
                                        foundItem.qty += reportItem.qty;
                                    } else {
                                        line.items.push(reportItem);
                                    }
                                }
                            }

                            report.total.avgCost =
                                FinancialMathService.currencyDivide(
                                    report.total.amount,
                                    report.total.qty);

                            return report;
                        };

                    /**
                     * Cancel a purchaseOrder
                     */
                    this.cancel =
                        function cancel (uuid) {
                            var result = true;
                            try {
                                result = PurchaseOrderKeeper.cancel(uuid);
                            } catch (err) {
                                throw 'PurchaseOrderService.cancel: Unable to cancel the purchaseOrder with uuid=' +
                                    uuid + '. ' + 'Err=' + err;
                            }
                            return result;
                        };

                    /**
                     * Redeem a purchaseOrder
                     */
                    this.redeem =
                        function redeem (uuid, extNumber) {
                            var result = null;
                            var redeemed = true;
                            try {
                                var purchaseOrder = this.read(uuid);
                                for ( var ix in purchaseOrder.items) {
                                    var item = purchaseOrder.items[ix];
                                    var receivedProducts =
                                        ArrayUtils.list(
                                            purchaseOrder.itemsReceived,
                                            'productId',
                                            item.id);
                                    var receivedQty =
                                        $filter('sum')(receivedProducts, 'qty', item.id);

                                    if (item.qty !== receivedQty) {
                                        redeemed = false;
                                        break;
                                    }
                                }
                                if (redeemed) {
                                    result = PurchaseOrderKeeper.redeem(uuid, extNumber);
                                } else {
                                    var deferred = $q.defer();
                                    deferred
                                        .resolve('PurchaseOrderService.redeem: Purchase order not fully received.');
                                    result = deferred.promise;
                                }
                            } catch (err) {
                                $q
                                    .reject('PurchaseOrderService.redeem: Unable to redeem the purchaseOrder with uuid=' +
                                        uuid + '. ' + 'Err=' + err);
                            }
                            return result;
                        };

                    // ===========================================
                    // Helpers
                    // ===========================================

                    /**
                     * Checks if a value is a boolean.
                     * 
                     * @param {*} val Value to be checked.
                     */
                    function isBoolean (val) {
                        return val === true || val === false;
                    }

                    /**
                     * Checks if the given array contains only valid items.
                     * 
                     * @param {*} items Array of items to validate.
                     */
                    function areValidItems (items) {
                        return angular.isArray(items) && items.length > 0;
                    }
                }
            ]);
}(angular));
