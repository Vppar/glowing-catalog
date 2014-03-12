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
        'tnt.catalog.service.data'
    ]).controller('AddCustomerEmailsDialogCtrl', [
        '$scope', '$q', '$filter', 'dialog', 'DialogService', function($scope, $q, $filter, dialog, DialogService) {

            $scope.email = {};
            $scope.isDisabled = true;
            /**
             * Regex created to only accept e-mails that follow the format
             * something@somewhere.whatever
             */
            $scope.emailRegex = /([a-z0-9!#$%&'*+\/=?^_`{|}~.-]+)@([a-z0-9]+\.[a-z0-9]+)$/;

            // get emails already set
            if (dialog.data.emails && dialog.data.emails.length > 0 && dialog.data.emails[0].address !== '') {
                $scope.emails = angular.copy(dialog.data.emails);
            } else {
                $scope.emails = [];
            }

            /**
             * Function add - Verifies if entered email already exists in the
             * $scope.emails array and if not, adds email to the last position
             * of $scope.emails array
             */
            $scope.addEmail = function addEmail(item) {
                if ($scope.newEmailForm.$valid && item.address) {
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

                if ($scope.newEmailForm.$valid && $scope.email.address) {
                    $scope.addEmail($scope.email);
                }

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

            /**
             * Watcher to control the visibility of the "Salvar" button.
             * 
             * ^([a-z0-9!#$%&'*+/=?^_`{|}~.-]+)@([a-z0-9]+\.[a-z0-9]+)$
             * 
             */
            $scope.$watchCollection('newEmailForm.$valid', function() {
                
                if($scope.newEmailForm.$valid){
                    if ($scope.email.address) {
                        $scope.isDisabled = false;
                    }else if ($scope.emails.length > 0 && $scope.newEmailForm.$valid) {
                        $scope.isDisabled = false;
                    }
                }else{
                    $scope.isDisabled = true;
                }
            });
        }
    ]);
}(angular));