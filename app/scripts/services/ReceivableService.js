(function(angular, _undefined) {
    'use strict';

    /**
     * Service to handle CRUD operations over DataProvider.receivables. At this
     * point delete operations are not relevant so they are not implemented.
     * 
     * @author Arnaldo S. Rodrigues Jr.
     */
    angular.module('tnt.catalog.service.receivable', [
        'tnt.catalog.filter.findBy', 'tnt.catalog.service.data'
    ]).service(
            'ReceivableService',
            function ReceivableService($log, $filter, DataProvider) {

                // Easy access to receivables
                var receivables = DataProvider.receivables;
                var MIN_TIME = 0;
                var MAX_TIME = 2147483647000;

                /**
                 * Function to validate if a parameter is empty or not present.
                 * 
                 * @param methodName - Method name to be used in the log.
                 * @param paramName - Parameter name to be used in the log.
                 * @param param - Object to be validated.
                 */
                function isFilled(methodName, paramName, param) {
                    var result = true;
                    if (param) {
                        var isEmpty = angular.equals(param, {});
                        if (isEmpty) {
                            result = false;
                            $log.error('ReceivableService.' + methodName + ': -Empty ' + paramName + '.');
                        }
                    } else {
                        result = false;
                        $log.error('ReceivableService.' + methodName + ': -Missing ' + paramName + '.');
                    }
                    return result;
                }

                /**
                 * Returns a new id to be used in a receivable.
                 * 
                 * @return id - Next id to receivable.
                 */
                var getNextId = function getNextId() {
                    return receivables.length + 1;
                };

                /**
                 * Create a new receivable in receivables.
                 * 
                 * @param receivable - Receivable to be created.
                 * @return id - Id of created receivable.
                 */
                var create = function create(receivable) {
                    var id = _undefined;
                    if (isFilled('create', 'receivable', receivable)) {
                        id = getNextId();
                        receivable.id = id;
                        receivable.createdate = new Date().getTime();
                        receivable.canceled = false;
                        receivables.push(receivable);
                    }
                    return id;
                };

                /**
                 * Return a copy of the receivables list.
                 * 
                 * @param window - Optional parameter to limit the result list.
                 *            If the object is passed, it must containing at
                 *            least one of parameters, startDate or endDate.
                 */
                var list =
                        function list(timeframe) {
                            var receivablesCopy = _undefined;
                            // test if there is a timeframe
                            if (timeframe) {
                                if (isValidTimeframe(timeframe)) {
                                    // if have a window parameter evaluate it
                                    receivablesCopy = [];
                                    // if have at least one of the parameters
                                    // evaluate them
                                    timeframe.startDate = timeframe.startDate ? timeframe.startDate : MIN_TIME;
                                    timeframe.endDate = timeframe.endDate ? timeframe.endDate : MAX_TIME;
                                    for ( var idx in receivables) {
                                        var receivable = receivables[idx];
                                        if (timeframe.startDate <= receivable.duedate && receivable.duedate <= timeframe.endDate) {
                                            receivablesCopy.push(angular.copy(receivable));
                                        }
                                    }
                                }
                            } else {
                                // if don't return all list
                                receivablesCopy = angular.copy(receivables);
                            }
                            if (receivablesCopy && receivablesCopy.length === 0) {
                                receivablesCopy = _undefined;
                                $log.error('ReceivableService.list: -No receivable found for the timeframe: ' + timeframe.startDate +
                                    ' - ' + timeframe.endDate);
                            }
                            return receivablesCopy;
                        };

                function isValidTimeframe(timeframe) {
                    var result = true;
                    if (!timeframe.startDate && !timeframe.endDate) {
                        $log.error('ReceivableService.list: -Missing all window parameters \'timeframe.startDate\' \'timeframe.endDate\'');
                        result = false;
                    } else if (timeframe.startDate > timeframe.endDate) {
                        $log.error('ReceivableService.list: Invalid timeframe parameters: ' + timeframe.startDate + ' - ' +
                            timeframe.endDate);
                        result = false;
                    }
                    return result;
                }

                /**
                 * Read a receivable by id.
                 * 
                 * @param id - Id of the receivable that must be found.
                 * @return receivable - Receivable found in the storage.
                 */
                var read = function read(id) {
                    var receivable = _undefined;
                    if (isFilled('read', 'id', id)) {
                        var result = $filter('findBy')(receivables, 'id', id);
                        if (result) {
                            receivable = angular.copy(result);
                        } else {
                            $log.error('ReceivableService.read: -Receivable not found: id=' + id);
                        }
                    }
                    return receivable;
                };

                /**
                 * Updates a existing receivable in the storage.
                 * 
                 * @param receivable - Receivable to be updated.
                 */
                var update = function update(receivable) {
                    var result = false;
                    if (isFilled('update', 'receivable', receivable)) {
                        var foundReceivable = $filter('findBy')(receivables, 'id', receivable.id);
                        console.log(foundReceivable);
                        if (foundReceivable) {
                            angular.extend(foundReceivable, receivable);
                            result = true;
                        } else {
                            $log.error('ReceivableService.update: -Could not find a receivable to update with id=' + receivable.id);
                        }
                    }
                    return result;
                };

                this.getNextId = getNextId;
                this.create = create;
                this.list = list;
                this.read = read;
                this.update = update;
            });
}(angular));