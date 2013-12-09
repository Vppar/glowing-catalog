(function(angular, _undefined) {
    'use strict';

    /**
     * Controller that encapsulates a receivable and handle its operations.
     * 
     * @author Arnaldo S. Rodrigues Jr.
     */
    angular.module('tnt.catalog.financial.receivable', []).controller(
            'ReceivableCtrl', function($scope, $log, ReceivableService, DataProvider) {

                // #############################################################################################################
                // Local variables
                // #############################################################################################################
                /**
                 * Target receivable to all controller operations.
                 */
                var receivable = {};
                /**
                 * Easy the access to the ReceivableService inside the
                 * controller.
                 */
                var service = ReceivableService;
                var data = DataProvider;

                // #############################################################################################################
                // Receivable functions
                // #############################################################################################################

                /**
                 * Cancel a receivable.
                 */
                var cancel = function cancel() {
                    var result = false;
                    if (receivable.id) {
                        if (!receivable.received) {
                            receivable.canceled = true;
                            result = service.update(receivable);
                        } else {
                            $log.error('ReceivableCtrl: -Unable to cancel an already fulfilled receivable.');
                        }
                    } else {
                        $log.error('ReceivableCtrl: -Unable to cancel a receivable that was not saved.');
                    }
                    return result;
                };

                /**
                 * Verifies if a receivable is valid.
                 */
                var isValid = function isValid() {
                    var result = true;
                    if (!isDueDateValid(receivable.duedate)) {
                        // due date can't be less then current date
                        result = false;
                    } else if (!isAmountValid(receivable.amount)) {
                        // amount must be greater than 0
                        result = false;
                    } else if (!isEntityValid(receivable.entity)) {
                        // Entity must be in the entities list
                        result = false;
                    }
                    return result;
                };

                /**
                 * Saves the receivable in the data storage
                 */
                var save = function save() {
                    var result = false;
                    if ($scope.isValid()) {
                        if (receivable.id) {
                            result = service.update(receivable);
                        } else {
                            var id = service.create(receivable);
                            receivable.id = id;
                            result = Boolean(id);
                        }
                    } else {
                        $log.error('ReceivableCtrl: -Invalid receivable: ' + JSON.stringify(receivable));
                    }
                    return result;
                };

                // #############################################################################################################
                // Auxiliary functions
                // #############################################################################################################

                /**
                 * Compares the due date against the current date. Returns true
                 * if due date is equal or greater than current date and returns
                 * false and log error otherwise.
                 * 
                 * @param duedate - Due date to be evaluated.
                 */
                function isDueDateValid(duedate) {
                    var result = true;
                    var now = new Date().getTime();
                    if (duedate < now) {
                        result = false;
                        $log.error('ReceivableCtrl: -Invalid due date=\'' + duedate + '\', now=\'' + now + '\'.');
                    }
                    return result;
                }
                /**
                 * Returns true if the amount is greater than 0 and returns
                 * false and log error otherwise.
                 * 
                 * @param amount - Amount to be evaluated.
                 */
                function isAmountValid(amount) {
                    var result = true;
                    if (amount <= 0) {
                        result = false;
                        $log.error('ReceivableCtrl: -Invalid amount: ' + amount + '.');
                    }
                    return result;
                }
                /**
                 * Returns true if the entity is in the entities list and
                 * returns false and log error otherwise.
                 * 
                 * @param entity - Entity to be evaluated.
                 */
                function isEntityValid(entity) {
                    var result = true;
                    if (entity) {
                        var foundEntity = $filter('findBy')(data.entities, 'id', entity.id);
                        var isValidEntity = angular.equals(entity, foundEntity);

                        if (!isValidEntity) {
                            result = false;
                            $log.error('ReceivableCtrl: -Invalid entity: ' + JSON.stringify(entity) + '.');
                        }
                    } else {
                        result = false;
                        $log.error('ReceivableCtrl: -Empty entity.');
                    }
                    return result;
                }

                // #############################################################################################################
                // Scope variables
                // #############################################################################################################
                /**
                 * Exposes the methods in the scope.
                 */
                $scope.receivable = receivable;
                $scope.cancel = cancel;
                $scope.isValid = isValid;
                $scope.save = save;
            });

}(angular));