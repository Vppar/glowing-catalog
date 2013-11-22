(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.check', [
        'tnt.catalog.filter.findBy'
    ]).controller('PaymentCheckCtrl', function($scope, $element, $filter, DialogService, PaymentService) {

        // #####################################################################################################
        // Warm up the controller
        // #####################################################################################################

        // Initialize the check field with a empty check and bind it to the
        // scope
        var check = {};
        var emptyCheckTemplate = {
            bank : null,
            agency : null,
            account : null,
            number : null,
            duedate : null,
            amount : null
        };
        angular.extend(check, emptyCheckTemplate);
        $scope.check = check;
        var payments = angular.copy($scope.payments);

        // Find the id of check payment type
        var checkTypeId = $scope.findPaymentTypeByDescription('check').id;

        // #####################################################################################################
        // Scope action functions
        // #####################################################################################################

        /**
         * Verifies if entered check already exists in the $scope.payments array
         * and if not, adds check to the last position.
         * 
         * @param newCheck - the object containing the newCheck data.
         */
        $scope.addCheck = function(newCheck) {
            // check if the all mandatory fields are filed.
            if ($scope.checkForm.$valid) {
                // check if is duplicated.
                if (isDuplicated(newCheck)) {
                    DialogService.messageDialog({
                        title : 'Pagamento com Cheque',
                        message : 'Não é possível inserir um cheque que já existe na lista.',
                        btnYes : 'OK'
                    });
                } else {
                    var payment = PaymentService.createNew('check');
                    payment.data = angular.copy(newCheck);
                    angular.extend(newCheck, emptyCheckTemplate);
                    $element.find('input').removeClass('ng-dirty').addClass('ng-pristine');
                }
            }
        };

        /**
         * Clear all check fields
         */
        $scope.clearCheck = function clearCheck() {
            angular.extend(check, emptyCheckTemplate);
            $element.find('input').removeClass('ng-dirty').addClass('ng-pristine');
        };

        /**
         * Removes selected check from $scope.payments array
         * 
         * @param paymentId - payment id of the check to be removed.
         */
        $scope.removeCheck = function removeCheck(payment) {
            var index = $scope.payments.indexOf(payment);
            $scope.payments.splice(index, 1);
        };

        $scope.confirmChecksPayments = function confirmChecksPayments() {
            $scope.selectPaymentMethod('none');
        };

        $scope.cancelChecksPayments = function cancelChecksPayments() {
            $scope.payments.length = payments.length;
            angular.extend($scope.payments, payments);
            $scope.selectPaymentMethod('none');
        };

        // #####################################################################################################
        // Auxiliary functions
        // #####################################################################################################

        /**
         * Check if the new check is already added into another payment.
         * 
         * @param newCheck - the object containing the newCheck data.
         */
        function isDuplicated(newCheck) {
            var checks = $filter('filter')($scope.payments, function(item) {
                var result = false;
                if (item.typeId === checkTypeId) {
                    // Done this way cause when everything is placed in one row
                    // the code became damn ugly.
                    result = item.data.bank === newCheck.bank;
                    result = result && (item.data.agency === newCheck.agency);
                    result = result && (item.data.account === newCheck.account);
                    result = result && (item.data.number === newCheck.number);
                }
                return result;
            });
            return checks.length > 0;
        }
    });
}(angular));