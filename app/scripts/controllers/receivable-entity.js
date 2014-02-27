(function(angular) {
    'use strict';

    /**
     * Controller that encapsulates a receivable and handle its operations.
     * 
     * @author Arnaldo S. Rodrigues Jr.
     */
    // FIXME: I've renamed it to ReceivableCtrlOLD because it seemed to be
    // conflicting with a newer controller defined in receivable.js
    angular.module('tnt.catalog.financial.receivable.entity', []).controller(
            'ReceivableCtrlOLD', function($scope, $log, $filter, DataProvider, DialogService, ReceivableService) {

                // #####################################################################################################
                // Local variables
                // #####################################################################################################
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

                // #####################################################################################################
                // Receivable functions
                // #####################################################################################################

                /**
                 * Cancel a receivable.
                 * 
                 * @returns boolean - If the receivable was canceled.
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
                 * 
                 * @returns boolean - If the receivable is valid
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
                 * Saves the receivable in the data storage.
                 * 
                 * @returns boolean - If the receivable was saved.
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

                /**
                 * Register that the receivable was received.
                 * 
                 * @param receiptDate - Date of receipt.
                 * @param amount - Amount received.
                 * @returns boolean - Result of the receipt.
                 */
                var receive = function receive(receiptDate, amount) {
                    var result = true;
                    var now = new Date().getTime();
                    if (receivable.canceled) {
                        result = false;
                        $log.error('ReceivableCtrl: -Unable to fulfill a canceled receivable.');
                    } else if (receivable.received) {
                        result = false;
                        $log.error('ReceivableCtrl: -The receivable is already fulfilled');
                    } else if (receiptDate > now) {
                        result = false;
                        $log.error('ReceivableCtrl: -Invalid receipt date.');
                    } else if (amount <= 0) {
                        result = false;
                        $log.error('ReceivableCtrl: -Invalid amount.');
                    } else {
                        receivable.received = {
                            receiptDate : receiptDate,
                            amount : amount
                        };
                        result = service.update(receivable);
                    }
                    return result;
                };

                /**
                 * Attach a document to the receivable
                 * 
                 * @param document - The document to be attached.
                 */
                var putDocument = function putDocument(document) {
                    var result = false;
                    if (document.isValid()) {
                        receivable.document = document;
                        service.update(receivable);
                        result = true;
                    } else {
                        DialogService.messageDialog({
                            title : 'Contas à Pagar',
                            message : 'Documento Inválido',
                            btnYes : 'OK'
                        });
                        $log.error('ReceivableCtrl: -Invalid document ' + JSON.stringify(document));
                    }
                    return result;
                };

                // #####################################################################################################
                // Auxiliary functions
                // #####################################################################################################

                /**
                 * Compares the due date against the current date. Returns true
                 * if due date is equal or greater than current date and returns
                 * false and log error otherwise.
                 * 
                 * @param duedate - Due date to be evaluated.
                 * @returns boolean - Result if the due date is valid.
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
                 * @returns boolean - Result if the amount is valid.
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
                 * @returns boolean - Result if the entity is valid.
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

                // #####################################################################################################
                // Scope variables
                // #####################################################################################################
                /**
                 * Exposes the methods in the scope.
                 */
                $scope.receivable = receivable;
                $scope.cancel = cancel;
                $scope.isValid = isValid;
                $scope.save = save;
                $scope.receive = receive;
                $scope.putDocument = putDocument;
            });

}(angular));
