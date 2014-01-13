(function(angular) {
    'use strict';
    
    /**
     * Service to manage operations over Receivables.
     * 
     * @author Arnaldo S. Rodrigues Jr.
     */
    angular.module('tnt.catalog.receivable.service', []).service('ReceivableService', function ReceivableService() {

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
         * Verifies if a receivable is valid or not.
         * 
         * @param receivable - Receivable object to be validated.
         * @return boolean - Result if the receivable is valid or not.
         */
        var isValid = function isValid(receivable) {
            return true;
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
         * Returns the full receivables list.
         * 
         * @return Array - Receivables list.
         */
        var list = function list() {
            return [];
        };

        /**
         * Updates a receivable instance.
         * 
         * @param receivable - Receivable to be updated. 
         * @return boolean - Result if the receivable is updated.
         */
        var update = function update(receivable) {
            return true;
        };

        /**
         * Cancel a receivable.
         * 
         * @param id - Receivable id.
         * @return boolean - Result if the receivable is canceled.
         */
        var cancel = function cancel(id) {
            return true;
        };

        this.isValid = isValid;
        this.register = register;
        this.get = get;
        this.list = list;
        this.update = update;
        this.cancel = cancel;
    });
}(angular));