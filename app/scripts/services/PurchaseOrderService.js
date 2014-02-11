(function(angular) {
    'use strict';
    angular.module('tnt.catalog.purchaseOrder.service', [
        'tnt.catalog.expense.entity', 'tnt.catalog.service.expense'
    ]).service('PurchaseOrderService', function PurchaseOrderService($q, $log, PurchaseOrderKeeper, Expense, PurchaseOrder, ExpenseService) {

        var isValid = function isValid(order) {
            var invalidProperty, result = [];

            // See validation helpers in the end of this file
            invalidProperty = {
                canceled : isBoolean(order.canceled),
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
                    var duedate = new Date();
                    var entityId = 0;
                    var expense = new Expense(uuid, new Date(), entityId, result.amount, duedate);
                    ExpenseService.register(expense);
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
            var result = null;
            try {
                result = PurchaseOrderKeeper.list();
            } catch (err) {
                $log.debug('PurchaseOrderService.list: Unable to recover the list of purchaseOrders. ' + 'Err=' + err);
            }
            return result;
        };

        /**
         * Read a specific purchaseOrder
         */
        var read = function read(uuid) {
            var result = null;
            try {
                result = PurchaseOrderKeeper.read(id);
            } catch (err) {
                $log.debug('PurchaseOrderService.read: Unable to find an purchaseOrder with the uuid=' + uuid + '. ' + 'Err=' + err);
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

        this.register = register;
        this.list = list;
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
