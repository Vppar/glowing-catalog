(function(angular) {
    'use strict';

    /**
     * AddCustomerTelsDialogCtrl controller
     * 
     * Controls phone list
     * 
     * @author Arnaldo
     * 
     */
    angular.module('glowingCatalogApp').controller(
            'AddCustomerTelsDialogCtrl', function($scope, $filter, dialog, DataProvider, DialogService) {

                $scope.dataProvider = DataProvider;
                $scope.phone = {};

                /**
                 * @var phones - stores phone list
                 */
                $scope.phones = [];

                /**
                 * Function addPhone - Verifies if entered phone already exists
                 * in the $scope.phones array and if not, adds phone to the last
                 * position of $scope.phones array
                 */
                $scope.addPhone = function addPhone(item) {
                    if ($scope.phoneForm.$valid) {
                        var phone = $filter('filter')($scope.phones, item.number);
                        if (phone.length === 0) {
                            $scope.phones.push(angular.copy(item));
                            delete $scope.phone;
                        }
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
                $scope.submitDialog = function() {
                    var phones = {};
                    if ($scope.phones.length >= 1) {
                        phones = $scope.phones;
                    } else {
                        phones = {
                            number : ''
                        };
                        // DialogService.messageDialog({
                        // tittle : 'Novo usuário',
                        // message : 'Nenhum telefone foi adicionado a lista.',
                        // btnYes : 'OK'
                        // });
                    }
                    dialog.close(phones);
                };

                /**
                 * Closes dialog
                 */
                $scope.closeDialog = function() {
                    dialog.close(dialog.data.phones);
                };

                /**
                 * Main function that starts up the scope.
                 */
                function main() {
                    if (dialog.data.phones[0] && dialog.data.phones[0].type) {
                        $scope.phone.number = '';
                        $scope.phones = angular.copy(dialog.data.phones);
                    }
                }
                main();

            });
}(angular));