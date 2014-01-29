(function(angular) {
    'use strict';

    /**
     * AddCustomerPhonesDialogCtrl controller
     * 
     * Controls phone list
     * 
     * @author Arnaldo
     * 
     */
    angular.module('tnt.catalog.customer.add.phones', [
        'tnt.catalog.service.data'
    ]).controller('AddCustomerPhonesDialogCtrl', function($scope, $q, $filter, dialog, DataProvider, DialogService) {

        $scope.phone = {
            number : undefined,
            type : undefined
        };
        //TODO get phones already set
        if(dialog.data.length > 0 && dialog.data[0].number !== '') {
            $scope.phones = dialog.data;
        } else {
            $scope.phones = [];
        }
        console.log($scope.phones);
        $scope.phoneTypes = DataProvider.phoneTypes;

        /**
         * Function add - Verifies if entered phone already exists in the
         * $scope.phones array and if not, adds phone to the last position of
         * $scope.phones array
         */
        $scope.addPhone = function addPhone(item) {
            if ($scope.newPhoneForm.$valid && item.number) {
                var phone = $filter('filter')($scope.phones, item.number);
                if (phone.length === 0) {
                    $scope.phones.push(angular.copy(item));
                    delete $scope.phone.number;
                    delete $scope.phone.type;
                } else {
                    DialogService.messageDialog({
                        title : 'Novo usuário',
                        message : 'O telefone informado já pertence a lista.',
                        btnYes : 'OK'
                    });
                }
            } else {
                DialogService.messageDialog({
                    title : 'Novo usuário',
                    message : 'O telefone informado é inválido.',
                    btnYes : 'OK'
                });
            }
        };

        /**
         * Moves up selected phone in $scope.phones array
         * 
         * @param index - position of phone to be moved
         */
        $scope.moveUp = function moveUp(index) {
            var previous = $scope.phones[index - 1];
            var actual = $scope.phones[index];
            $scope.phones.splice(index - 1, 2, actual, previous);
        };

        /**
         * Moves down selected phone in $scope.phones array
         * 
         * @param index - position of phone to be moved
         */
        $scope.moveDown = function moveDown(index) {
            var next = $scope.phones[index + 1];
            var actual = $scope.phones[index];
            $scope.phones.splice(index, 2, next, actual);
        };

        /**
         * Removes selected phone from $scope.phones array
         * 
         * @param index - position of phone to be removed
         */
        $scope.remove = function remove(index) {
            $scope.phones.splice(index, 1);
        };

        /**
         * Submits dialog
         */
        $scope.confirm = function() {
            var phones = {};
            if ($scope.phones.length >= 1) {
                phones = $scope.phones;
            } 
            dialog.close(phones);
        };

        /**
         * Closes dialog
         */
        $scope.cancel = function() {
            dialog.close($q.reject());
        };

    });
}(angular));