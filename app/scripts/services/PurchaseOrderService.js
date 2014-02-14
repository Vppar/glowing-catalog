(function(angular) {
    'use strict';
    angular.module('tnt.catalog.purchaseOrder.service', [
        'tnt.utils.array', 'tnt.catalog.expense.entity', 'tnt.catalog.service.expense', 'tnt.catalog.purchaseOrder'
    ]).service(
            'PurchaseOrderService',
            function PurchaseOrderService($q, $log, $filter, ArrayUtils, Expense, PurchaseOrder, PurchaseOrderKeeper, ExpenseService) {

                var isValid = function isValid(order) {
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
                var register = function register(purchase) {
                    var result = null;
                    var hasErrors = isValid(purchase);
                    if (hasErrors.length === 0) {
                        result = PurchaseOrderKeeper.add(new PurchaseOrder(purchase));
                        result.then(function(uuid) {
                            // TODO - Uncomment and correct this section, we
                            // need to create a Expense.
                            // var duedate = new Date();
                            // var entityId = 0;
                            // var expense = new Expense(null, new Date(),
                            // entityId, result.amount, duedate);
                            // expense.documentId = uuid;
                            // ExpenseService.register(expense);
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
                 * List all PurchaseOrders.
                 */
                var list = function list() {
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
                var read =
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

                /**
                 * Receive an item of a purchaseOrder
                 */
                var receive =
                        function receive(uuid, productUuid, nfeNumber, missingQty) {
                            var result = true;
                            var qty = null;
                            try {
                                var numericProductUuid = Number(productUuid);
                                var purchaseOrder = read(uuid);
                                var productPurchase = ArrayUtils.find(purchaseOrder.items, 'id', numericProductUuid);
                                var productDelivers = ArrayUtils.list(purchaseOrder.itemsReceived, 'id', numericProductUuid);

                                qty = productPurchase.qty - (missingQty ? missingQty : 0);

                                if (productDelivers.length > 0) {
                                    var purchasesQty = productPurchase.qty;
                                    var deliveredQty = $filter('sum')(productDelivers, 'qty', numericProductUuid);

                                    if ((deliveredQty + qty) > purchasesQty) {
                                        throw 'The deliver that is being informed is greater than the total ordered';
                                    }
                                }
                                result = PurchaseOrderKeeper.receive(uuid, numericProductUuid, nfeNumber, qty);
                            } catch (err) {
                                throw 'PurchaseOrderService.receive: Unable to receive the item with uuid=' + productUuid +
                                    ' of the purchaseOrder with uuid=' + uuid + '. ' + 'Err=' + err;
                            }
                            return result;
                        };

                var filterReceived = function filterReceived(purchaseOrder) {
                    var result = angular.copy(purchaseOrder);
                    for ( var i = 0; i < result.items.length;) {

                        var item = purchaseOrder.items[ix];
                        var productDelivers = ArrayUtils.list(purchaseOrder.itemsReceived, 'id', item.id);
                        var receivedQty = $filter('sum')(productDelivers, 'qty');

                        item.qty = item.qty - receivedQty;

                        if (item.qty === 0) {
                            result.items.splice(i, 0);
                        } else {
                            i++;
                        }
                    }
                    return result;
                };

                /**
                 * Cancel a purchaseOrder
                 */
                var cancel = function cancel(uuid) {
                    var result = true;
                    try {
                        result = PurchaseOrderKeeper.cancel(uuid);
                    } catch (err) {
                        throw 'PurchaseOrderService.cancel: Unable to cancel the purchaseOrder with uuid=' + uuid + '. ' + 'Err=' + err;
                    }
                    return result;
                };

                /**
                 * Redeem a purchaseOrder
                 */
                var redeem = function redeem(uuid) {
                    var result = true;
                    try {
                        result = PurchaseOrderKeeper.redeem(uuid);
                    } catch (err) {
                        throw 'PurchaseOrderService.redeem: Unable to redeem the purchaseOrder with uuid=' + uuid + '. ' + 'Err=' + err;
                    }
                    return result;
                };

                this.register = register;
                this.list = list;
                this.read = read;
                this.filterReceived = filterReceived;
                this.receive = receive;
                this.cancel = cancel;
                this.redeem = redeem;
                this.isValid = isValid;

                // ===========================================
                // Helpers
                // ===========================================

                /**
                 * Checks if a value is a boolean.
                 * 
                 * @param {*} val Value to be checked.
                 */
                function isBoolean(val) {
                    return val === true || val === false;
                }

                /**
                 * Checks if the given array contains only valid items.
                 * 
                 * @param {*} items Array of items to validate.
                 */
                function areValidItems(items) {
                    return angular.isArray(items) && items.length > 0;
                }
            });
}(angular));
