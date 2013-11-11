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
    angular.module('tnt.catalog.customer.add.emails', [
        'tnt.catalog'
    ]).controller('AddCustomerEmailsDialogCtrl', function($scope, $q, $filter, dialog, DialogService) {

        $scope.email = {};
        $scope.emails = angular.copy(dialog.data.emails);

        /**
         * Function add - Verifies if entered email already exists in the
         * $scope.emails array and if not, adds email to the last position of
         * $scope.emails array
         */
        $scope.add = function add(item) {
            if ($scope.newEmailForm.$valid) {
                var emails = $filter('filter')($scope.emails, item.address);
                if (emails.length === 0) {
                    $scope.emails.push(angular.copy(item));
                    delete $scope.email.address;
                } else {
                    DialogService.messageDialog({
                        title : 'Novo usuário',
                        message : 'O e-mail informado já pertence a lista.',
                        btnYes : 'OK'
                    });
                }
            } else {
                DialogService.messageDialog({
                    title : 'Novo usuário',
                    message : 'O e-mail informado é inválido.',
                    btnYes : 'OK'
                });
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
        $scope.confirm = function() {
            var emails = {};
            if ($scope.emails.length >= 1) {
                emails = $scope.emails;
            } else {
                emails = {
                    address : ''
                };
            }
            dialog.close(emails);
        };

        /**
         * Closes dialog
         */
        $scope.cancel = function() {
            dialog.close($q.reject());
        };

    });
}(angular));