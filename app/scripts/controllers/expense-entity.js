(function(angular) {
    'use strict';

    /**
     * Controller that encapsulates a expense and handle its operations.
     * 
     * @author Arnaldo S. Rodrigues Jr.
     */
    angular.module('tnt.catalog.financial.expense.entity', [
        'tnt.catalog.filter.findBy'
    ]).controller('ExpenseEntityCtrl', ['$scope', '$log', '$filter', 'DataProvider', 'DialogService', 'ExpenseService', function($scope, $log, $filter, DataProvider, DialogService, ExpenseService) {

        // #####################################################################################################
        // Local variables
        // #####################################################################################################
        /**
         * Target expense to all controller operations.
         */
        var expense = {};
        /**
         * Easy the access to the ExpenseService inside the controller.
         */
        var service = ExpenseService;
        var data = DataProvider;

        // #####################################################################################################
        // Expense functions
        // #####################################################################################################

        /**
         * Cancel a expense.
         * 
         * @returns boolean - If the expense was canceled.
         */
        var cancel = function cancel() {
            var result = false;
            if (expense.id) {
                if (!expense.received) {
                    expense.canceled = true;
                    result = service.update(expense);
                } else {
                    $log.error('ExpenseCtrl: -Unable to cancel an already fulfilled expense.');
                }
            } else {
                $log.error('ExpenseCtrl: -Unable to cancel a expense that was not saved.');
            }
            return result;
        };

        /**
         * Verifies if a expense is valid.
         * 
         * @returns boolean - If the expense is valid
         */
        var isValid = function isValid() {
            var result = true;
            if (!isDueDateValid(expense.duedate)) {
                // due date can't be less then current date
                result = false;
            } else if (!isAmountValid(expense.amount)) {
                // amount must be greater than 0
                result = false;
            } else if (!isEntityValid(expense.entity)) {
                // Entity must be in the entities list
                result = false;
            }
            return result;
        };

        /**
         * Saves the expense in the data storage.
         * 
         * @returns boolean - If the expense was saved.
         */
        var save = function save() {
            var result = false;
            if ($scope.isValid()) {
                if (expense.id) {
                    result = service.update(expense);
                } else {
                    var id = service.create(expense);
                    expense.id = id;
                    result = Boolean(id);
                }
            } else {
                $log.error('ExpenseCtrl: -Invalid expense: ' + JSON.stringify(expense));
            }
            return result;
        };

        /**
         * Register that the expense was received.
         * 
         * @param receiptDate - Date of receipt.
         * @param amount - Amount received.
         * @returns boolean - Result of the receipt.
         */
        var receive = function receive(receiptDate, amount) {
            var result = true;
            var now = new Date().getTime();
            if (expense.canceled) {
                result = false;
                $log.error('ExpenseCtrl: -Unable to fulfill a canceled expense.');
            } else if (expense.received) {
                result = false;
                $log.error('ExpenseCtrl: -The expense is already fulfilled');
            } else if (receiptDate > now) {
                result = false;
                $log.error('ExpenseCtrl: -Invalid receipt date.');
            } else if (amount <= 0) {
                result = false;
                $log.error('ExpenseCtrl: -Invalid amount.');
            } else {
                expense.received = {
                    receiptDate : receiptDate,
                    amount : amount
                };
                result = service.update(expense);
            }
            return result;
        };

        /**
         * Attach a document to the expense
         * 
         * @param document - The document to be attached.
         */
        var putDocument = function putDocument(document) {
            var result = false;
            if (document.isValid()) {
                expense.document = document;
                service.update(expense);
                result = true;
            } else {
                DialogService.messageDialog({
                    title : 'Contas à Pagar',
                    message : 'Documento Inválido',
                    btnYes : 'OK'
                });
                $log.error('ExpenseCtrl: -Invalid document ' + JSON.stringify(document));
            }
            return result;
        };

        // #####################################################################################################
        // Auxiliary functions
        // #####################################################################################################

        /**
         * Compares the due date against the current date. Returns true if due
         * date is equal or greater than current date and returns false and log
         * error otherwise.
         * 
         * @param duedate - Due date to be evaluated.
         * @returns boolean - Result if the due date is valid.
         */
        function isDueDateValid(duedate) {
            var result = true;
            var now = new Date().getTime();
            if (duedate < now) {
                result = false;
                $log.error('ExpenseCtrl: -Invalid due date=\'' + duedate + '\', now=\'' + now + '\'.');
            }
            return result;
        }
        /**
         * Returns true if the amount is greater than 0 and returns false and
         * log error otherwise.
         * 
         * @param amount - Amount to be evaluated.
         * @returns boolean - Result if the amount is valid.
         */
        function isAmountValid(amount) {
            var result = true;
            if (amount <= 0) {
                result = false;
                $log.error('ExpenseCtrl: -Invalid amount: ' + amount + '.');
            }
            return result;
        }
        /**
         * Returns true if the entity is in the entities list and returns false
         * and log error otherwise.
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
                    $log.error('ExpenseCtrl: -Invalid entity: ' + JSON.stringify(entity) + '.');
                }
            } else {
                result = false;
                $log.error('ExpenseCtrl: -Empty entity.');
            }
            return result;
        }

        // #####################################################################################################
        // Scope variables
        // #####################################################################################################
        /**
         * Exposes the methods in the scope.
         */
        $scope.expense = expense;
        $scope.cancel = cancel;
        $scope.isValid = isValid;
        $scope.save = save;
        $scope.receive = receive;
        $scope.putDocument = putDocument;
    }]);

}(angular));