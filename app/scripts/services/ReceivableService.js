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
            function ReceivableService($log, Receivable, CoinKeeper) {

                var ReceivableKeeper = CoinKeeper('receivable');

                /**
                 * Verifies if a receivable is valid or not.
                 * 
                 * @param receivable - Receivable object to be validated.
                 * @return Array - Array of objects containing the invalid
                 *         properties
                 */
                var isValid =
                        function isValid(receivable) {
                            var invalidProperty = {};

                            invalidProperty.creationdate =
                                    angular.isNumber(receivable.creationdate) && receivable.creationdate <= new Date().getTime();
                            // FIXME - Verify if is a valid entityId
                            invalidProperty.entityId = angular.isNumber(receivable.entityId);
                            // FIXME - Verify if is a valid receivable type
                            invalidProperty.type = angular.isDefined(receivable.type);
                            invalidProperty.amount = Number(receivable.amount) > 0;
                            invalidProperty.installmentSeq = angular.isNumber(receivable.installmentSeq);
                            invalidProperty.duedate = angular.isNumber(receivable.duedate) && receivable.duedate > new Date().getTime();

                            var result = [];

                            for ( var ix in invalidProperty) {
                                if (!invalidProperty[ix]) {
                                    // Create a new empty object, set a property
                                    // with the name of the invalid property,
                                    // fill it with the invalid value and add to
                                    // the result
                                    result.push({}[ix] = receivable[ix]);
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
                        $log.debug('ReceivableService.list: Unable to recover the list of receivables. Err=' + err);
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
                        $log.debug('ReceivableService.read: Unable to find a receivable with id=\'' + id + '. Err=' + err);
                    }
                    return result;
                };

                /**
                 * Register a receivable in the datastore.
                 * 
                 * @param receivable - Receivable object to be registered.
                 * @return Array - Array of objects containing the invalid
                 *         properties.
                 * @throws Exception in case of a fatal error comming from the
                 *             keeper.
                 */
                var register =
                        function register(receivable) {
                            var result = this.isValid(receivable);
                            if (result.length === 0) {
                                try {
                                    ReceivableKeeper.add(receivable);
                                } catch (err) {
                                    throw 'ReceivableService.register: Unable to register a receivable=' + JSON.stringify(receivable) +
                                        '. Err=' + err;
                                }
                            }
                            return result;
                        };

                /**
                 * Pseudo update a receivable in the datastore. What it really
                 * does is cancel the receivable and create a new one.
                 * 
                 * @param receivable - Receivable to be registered.
                 * @return Array - Array of objects containing the invalid
                 *         properties.
                 * @throws Exception in case of a fatal error comming from the
                 *             keeper.
                 */
                var update =
                        function update(receivable) {
                            var result = isValid(receivable);
                            if (result.length === 0) {
                                try {
                                    ReceivableKeeper.cancel(receivable.id);
                                    ReceivableKeeper.add(receivable);
                                } catch (err) {
                                    throw 'ReceivableService.register: Unable to register a receivable=' + JSON.stringify(receivable) +
                                        '. Err=' + err;
                                }
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
                                ReceivableKeeper.liquidate(id, receiveDate);
                            } catch (err) {
                                result = false;
                                $log.debug('ReceivableService.register: Unable to receive a payment to a receivable=' +
                                    JSON.stringify(receivable) + '. Err=' + err);
                            }
                            return result;
                        };

                /**
                 * Cancels a receivable.
                 * 
                 * @param id - Receivable id.
                 * @return boolean - Result if the receivable is canceled.
                 */
                var cancel =
                        function cancel(id) {
                            var result = true;
                            try {
                                ReceivableKeeper.cancel(id);
                            } catch (err) {
                                result = false;
                                $log.debug('ReceivableService.register: Unable to cancel a receivable=' + JSON.stringify(receivable) +
                                    '. Err=' + err);
                            }
                            return result;
                        };

                this.isValid = isValid;
                this.register = register;
                this.update = update;
                this.read = read;
                this.list = list;
                this.receive = receive;
                this.cancel = cancel;
            });
}(angular));