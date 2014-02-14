(function(angular) {
    'use strict';
    angular.module('tnt.catalog.purchaseOrder.service', [
        'tnt.utils.array', 'tnt.catalog.expense.entity', 'tnt.catalog.service.expense', 'tnt.catalog.purchaseOrder', 'tnt.catalog.filter.sum'
    ]).service(
            'PurchaseOrderService',
            function PurchaseOrderService($q, $log, $filter, ArrayUtils, Expense, PurchaseOrder, PurchaseOrderKeeper, ExpenseService) {

                this.isValid = function isValid(order) {
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
                this.register = function register(purchase) {
                    var result = null;
                    var hasErrors = this.isValid(purchase);
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

                this.receive =
                        function receive(uuid, productId, nfeNumber, receiveQty) {
                            var result = true;
                            var numericProductId = Number(productId);
                            try {
                                var purchaseOrder = this.read(uuid);
                                var purchasedProduct = ArrayUtils.find(purchaseOrder.items, 'id', numericProductId);
                                var receivedProducts = ArrayUtils.list(purchaseOrder.itemsReceived, 'productId', numericProductId);

                                if (receivedProducts.length > 0) {
                                    var purchasedQty = purchasedProduct.qty;
                                    var receivedQty = $filter('sum')(receivedProducts, 'qty', numericProductId);

                                    if ((receivedQty + receiveQty) > purchasedQty) {
                                        throw 'The deliver that is being informed is greater than the total ordered';
                                    }
                                }
                                result = PurchaseOrderKeeper.receive(uuid, numericProductId, nfeNumber, receiveQty);
                            } catch (err) {
                                throw 'PurchaseOrderService.receive: Unable to receive the item with id=' + numericProductId +
                                    ' of the purchaseOrder with uuid=' + uuid + '. ' + 'Err=' + err;
                            }
                            return result;
                        };

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

                this.filterPending = function filterPending() {
                    var orders = this.list();
                    var pending = []; 
                    for(var i in orders){
                        if(orders[i].received){
                            //do nothing
                        }else{
                            pending.push(this.filterReceived(orders[i]));
                        }
                    }
                    return pending;
                };

                /**
                 * Cancel a purchaseOrder
                 */
                this.cancel = function cancel(uuid) {
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
                this.redeem = function redeem(uuid) {
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
                            result = PurchaseOrderKeeper.redeem(uuid);
                        } else {
                            result = $q.reject('PurchaseOrderService.redeem: Purchase order not fully received.');
                        }
                    } catch (err) {
                        throw 'PurchaseOrderService.redeem: Unable to redeem the purchaseOrder with uuid=' + uuid + '. ' + 'Err=' + err;
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
