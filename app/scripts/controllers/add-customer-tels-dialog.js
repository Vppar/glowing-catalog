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
            'AddCustomerTelsDialogCtrl', function($scope, $filter, dialog, DataProvider) {

                $scope.dataProvider = DataProvider;

                $scope.phone = {};
                $scope.phone.number = dialog.phone;

                /**
                 * @var phones - stores phone list
                 */
                $scope.phones = dialog.phones;

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
                    dialog.close($scope.phones);
                };

                /**
                 * Closes dialog
                 */
                $scope.closeDialog = function() {
                    dialog.close();
                };

            });
}(angular));