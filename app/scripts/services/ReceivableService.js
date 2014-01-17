(function(angular) {
    'use strict';

    /**
     * Service to manage operations over Receivables.
     * 
     * @author Arnaldo S. Rodrigues Jr.
     */
    angular.module('tnt.catalog.receivable.service', [
        'tnt.catalog.receivable.entity', 'tnt.catalog.receivable.keeper'
    ]).service(
            'ReceivableService',
            function ReceivableService($log, CoinKeeper) {
                
                var ReceivableKeeper = CoinKeeper('receivable');

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

                    var result = [];
                    for ( var ix in this) {
                        if (!angular.isFunction(this[ix])) {
                            if (!this[ix]) {
                                result.push({
                                    ix : receivable[ix]
                                });
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
                    var result = null;
                    try {
                        result = ReceivableKeeper.list();
                    } catch (err) {
                        $log.debug ('ReceivableService.list: Unable to recover the list of receivables. Err=' + err);
                    }
                    return result;
                };

                /**
                 * Returns a single receivable by its id.
                 * 
                 * @param id - Receivable id.
                 * @return Receivable - The desired receivable.
                 */
                var read = function read(id) {
                    var result = null;
                    try {
                        result = ReceivableKeeper.read(id);
                    } catch (err) {
                        $log.debug ('ReceivableService.read: Unable to find a receivable with id=\'' + id + '. Err=' + err);
                    }
                    return result;
                };

                /**
                 * Verify if a receivable is valid and register in the
                 * datastore.
                 * 
                 * @param receivable - Receivable object to be registered.
                 * @return boolean - Result if the receivable was accepted or
                 *         declined.
                 */
                var register =
                        function register(receivable) {
                            var result = true;
                            try {
                                ReceivableKeeper.add(receivable);
                            } catch (err) {
                                result = false;
                                $log.debug('ReceivableService.register: Unable to register a receivable=' + JSON.stringify(receivable) +
                                    ', ' + err);
                            }
                            return result;
                        };

                /**
                 * Receive a payment to a receivable.
                 * 
                 * @param id - Receivable id.
                 * @return boolean - Result if the receivable is canceled.
                 */
                var receive =
                        function receive(id, receiveDate) {
                            var result = true;
                            try {
                                ReceivableKeeper.receive(id, receiveDate);
                            } catch (err) {
                                result = false;
                                $log.debug('ReceivableService.register: Unable to receive a payment to a receivable=' +
                                    JSON.stringify(receivable) + ', ' + err);
                            }
                            return result;
                        };

                /**
                 * Cancels a receivable.
                 * 
                 * @param id - Receivable id.
                 * @return boolean - Result if the receivable is canceled.
                 */
                var cancel = function cancel(id) {
                    var result = true;
                    try {
                        ReceivableKeeper.cancel(id);
                    } catch (err) {
                        result = false;
                        $log.debug('ReceivableService.register: Unable to cancel a receivable=' + JSON.stringify(receivable) + ', ' + err);
                    }
                    return result;
                };

                this.isValid = isValid;
                this.register = register;
                this.read = read;
                this.list = list;
                this.receive = receive;
                this.cancel = cancel;
            });
}(angular));