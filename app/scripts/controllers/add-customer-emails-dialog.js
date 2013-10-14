(function(angular) {
    'use strict';

    /**
     * AddCustomerEmailsDialogCtrl controller
     * 
     * Controls email list
     * 
     * @author Arnaldo
     * 
     */
    angular.module('glowingCatalogApp').controller('AddCustomerEmailsDialogCtrl', function($scope, $filter, dialog) {

        $scope.email = {};
        $scope.email.address = dialog.email;

        /**
         * @var emails - stores email list
         */
        $scope.emails = dialog.emails;

        /**
         * Function addEmail - Verifies if entered email already exists in the $scope.emails array and
         * if not, adds email to the last position of $scope.emails array
         */
        $scope.addEmail = function addEmail(item) {
            if (item && item.address) {
                var emails= $filter('filter')($scope.emails, item.address);
                if (emails.length === 0) {
                    $scope.emails.push(angular.copy(item));
                    delete $scope.email;
                }
            }
        };

        /**
         * Moves up selected email in $scope.emails array
         * 
         * @param index - position of email to be moved
         */
        $scope.moveUp = function moveUp(index) {
            var previous = $scope.emails[index - 1];
            var actual = $scope.emails[index];
            $scope.emails.splice(index - 1, 2, actual, previous);
        };

        /**
         * Moves down selected email in $scope.emails array
         * 
         * @param index - position of email to be moved
         */
        $scope.moveDown = function moveDown(index) {
            var next = $scope.emails[index + 1];
            var actual = $scope.emails[index];
            $scope.emails.splice(index, 2, next, actual);
        };

        /**
         * Removes selected email from $scope.emails array
         * 
         * @param index - position of email to be removed
         */
        $scope.remove = function remove(index) {
            $scope.emails.splice(index, 1);
        };

        /**
         * Submits dialog
         */
        $scope.submitDialog = function() {
            dialog.close($scope.emails);
        };

        /**
         * Closes dialog
         */
        $scope.closeDialog = function() {
            dialog.close();
        };
    });
}(angular));