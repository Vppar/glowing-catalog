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
    angular.module('glowingCatalogApp').controller('AddCustomerEmailsDialogCtrl', function($scope, $filter, dialog, DialogService) {

        $scope.email = {};

        /**
         * @var emails - stores email list
         */
        $scope.emails = [];

        /**
         * Function addEmail - Verifies if entered email already exists in the
         * $scope.emails array and if not, adds email to the last position of
         * $scope.emails array
         */
        $scope.addEmail = function addEmail(item) {
            if ($scope.emailForm.$valid) {
                var emails = $filter('filter')($scope.emails, item.address);
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
            var emails = {};
            if ($scope.emails.length >= 1) {
                emails = $scope.emails;
            } else {
                emails = {
                    address : ''
                };
                // DialogService.messageDialog({
                // tittle : 'Novo usuário',
                // message : 'Nenhum e-mail foi adicionado a lista.',
                //                    btnYes : 'OK'
                //                });
            }
            dialog.close(emails);
        };

        /**
         * Closes dialog
         */
        $scope.closeDialog = function() {
            dialog.close(dialog.data.emails);
        };

        /**
         * Main function that starts up the scope.
         */
        function main() {
            if (dialog.data.emails[0] && dialog.data.emails[0].address && dialog.data.emails[0].address !== '') {
                $scope.email.address = '';
                $scope.emails = angular.copy(dialog.data.emails);
            }
        }
        main();
    });
}(angular));