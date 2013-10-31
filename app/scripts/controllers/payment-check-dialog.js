(function(angular) {
    'use strict';

    /**
     * PaymentCheckDialogCtrl controller
     * 
     * Controls check list
     * 
     * @author Fillipe
     * 
     */
    angular.module('glowingCatalogApp').controller('PaymentCheckDialogCtrl', function($scope, $filter, dialog) {

        /**
         * @var checks - stores check list
         */
        $scope.check = {};
        $scope.payments = angular.copy(dialog.data.payments);

        function watchChecks() {
            $scope.payments.checksTotal = 0;
            for ( var i = 0; i < $scope.payments.checks.length; i++) {
                $scope.payments.checksTotal += Number($scope.payments.checks[i].amount);
            }
            $scope.payments.total = $scope.payments.creditCardsTotal + $scope.payments.checksTotal;
        }
        $scope.$watch('payments', watchChecks, true);

        /**
         * Function addCheck - Verifies if entered check already exists in the
         * $scope.checks array and if not, adds check to the last position of
         * $scope.checks array
         */
        $scope.addCheck = function(item) {

            if ($scope.checkForm.$valid) {
                var check = $filter('filter')($scope.payments.checks, function(check) {
                    // Done this way cause when everything is placed in one row
                    // the code became damn ugly.
                    var result = check.bank === item.bank;
                    result = result && (check.agency === item.agency);
                    result = result && (check.account === item.account);
                    result = result && (check.check === item.check);
                    return result;
                });
                if (check.length === 0) {
                    $scope.payments.checks.push(angular.copy(item));
                    delete $scope.check;
                }
            }
        };

        /**
         * Removes selected check from $scope.checks array
         * 
         * @param index - position of check to be removed
         */
        $scope.remove = function remove(index) {
            $scope.payments.checks.splice(index, 1);
        };

        /**
         * Submits dialog
         */
        $scope.submitDialog = function() {
            dialog.close($scope.payments);
        };

        /**
         * Closes dialog
         */
        $scope.closeDialog = function() {
            dialog.close();
        };

    });
}(angular));