(function(angular) {
    'use strict';

    /**
     * Service to manage operations over Expense.
     */
    angular.module('tnt.catalog.service.expense', [
        'tnt.catalog.expense.entity', 'tnt.catalog.receivable.keeper'
    ]).service('ExpenseService', function ExpenseService($log, CoinKeeper) {

        var ExpenseKeeper = CoinKeeper('expense');

        /**
         * Verifies if a expense is valid or not.
         * 
         * @param expense - expense object to be validated.
         * @return boolean - Result if the expense is valid or not.
         */
        var isValid = function isValid(expense) {
            this.creationdate = angular.isNumber(expense.creationdate) && expense.creationdate <= new Date().getTime();
            // FIXME - Verify if is a valid entityId
            this.entityId = angular.isNumber(expense.entityId);
            // FIXME - Verify if is a valid expense type
            this.type = angular.isDefined(expense.type);
            this.amount = Number(expense.amount) > 0;
            this.installmentSeq = angular.isNumber(expense.installmentSeq);
            this.duedate = angular.isNumber(expense.duedate) && expense.duedate > new Date().getTime();

            var result = [];
            for ( var ix in this) {
                if (!angular.isFunction(this[ix])) {
                    if (!this[ix]) {
                        result.push({
                            ix : expense[ix]
                        });
                    }
                }
            }

            return result;
        };

        /**
         * Returns the full expense list.
         * 
         * @return Array - expense list.
         */
        var list = function list() {
            var result = null;
            try {
                result = ExpenseKeeper.list();
            } catch (err) {
                $log.debug('ExpenseService.list: Unable to recover the list of expense. Err=' + err);
            }
            return result;
        };

        /**
         * Returns a single expense by its id.
         * 
         * @param id - expense id.
         * @return expense - The desired expense.
         */
        var read = function read(id) {
            var result = null;
            try {
                result = ExpenseKeeper.read(id);
            } catch (err) {
                $log.debug('ExpenseService.read: Unable to find a expense with id=\'' + id + '. Err=' + err);
            }
            return result;
        };

        /**
         * Verify if a expense is valid and register in the datastore.
         * 
         * @param expense - expense object to be registered.
         * @return boolean - Result if the expense was accepted or declined.
         */
        var register = function register(expense) {
            var result = true;
            try {
                ExpenseKeeper.add(expense);
            } catch (err) {
                result = false;
                $log.debug('ExpenseService.register: Unable to register a expense=' + JSON.stringify(expense) + ', ' + err);
            }
            return result;
        };

        /**
         * Receive a payment to a expense.
         * 
         * @param id - expense id.
         * @return boolean - Result if the expense is canceled.
         */
        var pay = function pay(id, dueDate) {
            var result = true;
            try {
                ExpenseKeeper.receive(id, dueDate);
            } catch (err) {
                result = false;
                $log.debug('ExpenseService.register: Unable to make the payment of expense=' + JSON.stringify(expense) + ', ' + err);
            }
            return result;
        };

        /**
         * Cancels a expense.
         * 
         * @param id - expense id.
         * @return boolean - Result if the expense is canceled.
         */
        var cancel = function cancel(id) {
            var result = true;
            try {
                ExpenseKeeper.cancel(id);
            } catch (err) {
                result = false;
                $log.debug('ExpenseService.register: Unable to cancel a expense=' + JSON.stringify(expense) + ', ' + err);
            }
            return result;
        };

        this.isValid = isValid;
        this.register = register;
        this.read = read;
        this.list = list;
        this.pay = pay;
        this.cancel = cancel;
    });
}(angular));