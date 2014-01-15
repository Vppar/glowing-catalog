(function(angular) {
    'use strict';

    /**
     * Service to manage operations over Receivables.
     * 
     * @author Arnaldo S. Rodrigues Jr.
     */
    angular.module('tnt.catalog.receivable.service', [
        'tnt.catalog.receivable.entity', 'tnt.catalog.receivable.keeper'
    ]).service('ReceivableService', function ReceivableService($log, ReceivableKeeper) {

        /**
         * Verifies if a receivable is valid or not.
         * 
         * @param receivable - Receivable object to be validated.
         * @return boolean - Result if the receivable is valid or not.
         */
        var isValid = function isValid(receivable) {
            this.creationdate = angular.isNumber(receivable.creationdate) && receivable.creationdate <= new Date().getTime();
            // FIXME - Verify if is a valid entityId
            this.entityId = angular.isNumber(receivable.entityId);
            // FIXME - Verify if is a valid receivable type
            this.type = angular.isDefined(receivable.type);
            this.amount = Number(receivable.amount) > 0;
            this.installmentSeq = angular.isNumber(receivable.installmentSeq);
            this.duedate = angular.isNumber(receivable.duedate) && receivable.duedate > new Date().getTime();

            var result = true;
            for ( var ix in this) {
                if (!angular.isFunction(this[ix])) {
                    result = result && this[ix];
                    if (!this[ix]) {
                        $log.debug('Invalid property ' + ix + '=' + receivable[ix]);
                    }
                }
            }

            return result;
        };

        /**
         * Returns the full receivables list.
         * 
         * @return Array - Receivables list.
         */
        var list = function list() {
            return [];
        };

        /**
         * Returns a single receivable by its id.
         * 
         * @param id - Receivable id.
         * @return Receivable - The desired receivable.
         */
        var get = function get(id) {
            return {};
        };

        /**
         * Verify if a receivable is valid and register in the datastore.
         * 
         * @param receivable - Receivable object to be registered.
         * @return boolean - Result if the receivable was accepted or declined.
         */
        var register = function register(receivable) {
            return true;
        };

        /**
         * Receive a payment to a receivable.
         * 
         * @param id - Receivable id.
         * @return boolean - Result if the receivable is canceled.
         */
        var receive = function receive(id) {
            return true;
        };

        /**
         * Cancels a receivable.
         * 
         * @param id - Receivable id.
         * @return boolean - Result if the receivable is canceled.
         */
        var cancel = function cancel(id) {
            return true;
        };

        this.isValid = isValid;
        this.register = register;
        this.list = list;
        this.get = get;
        this.receive = receive;
        this.cancel = cancel;
    });
}(angular));