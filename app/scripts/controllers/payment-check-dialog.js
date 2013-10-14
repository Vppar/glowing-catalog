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
        $scope.checks = [];

        /**
         * Function addCheck - Verifies if entered check already exists in the
         * $scope.checks array and if not, adds check to the last position of
         * $scope.checks array
         */
        $scope.addCheck = function(item) {

            if ($scope.checkForm.$valid) {
                var check = $filter('filter')($scope.checks, {
                    bank : item.bank,
                    agency : item.agency,
                    account : item.account,
                    check : item.check
                });
                if (check.length === 0) {
                    $scope.checks.push(angular.copy(item));
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
            $scope.checks.splice(index, 1);
        };

        /**
         * Submits dialog
         */
        $scope.submitDialog = function() {
            dialog.close($scope.checks);
        };

        /**
         * Closes dialog
         */
        $scope.closeDialog = function() {
            dialog.close();
        };

    });
}(angular));