(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('AddCustomerTelsDialogCtrl', function($scope, $filter, dialog, DataProvider) {

        $scope.dataProvider = DataProvider;
        
        $scope.phone = {};
        $scope.phone.number = dialog.phone;
        
        $scope.phones = dialog.phones;

        $scope.addPhone = function addPhone(item) {
            if (item && item.type && item.number && item.number.length >= 10) {
                var phone = $filter('filter')($scope.phones, item.number);
                if (phone.length === 0) {
                    $scope.phones.push(angular.copy(item));
                    delete $scope.phone;
                }
            }
        };

        $scope.moveUp = function moveUp(index) {
            var previous = $scope.phones[index - 1];
            var actual = $scope.phones[index];
            $scope.phones.splice(index - 1, 2, actual, previous);
        };

        $scope.moveDown = function moveDown(index) {
            var next = $scope.phones[index + 1];
            var actual = $scope.phones[index];
            $scope.phones.splice(index, 2, next, actual);
        };

        $scope.remove = function remove(index) {
            $scope.phones.splice(index, 1);
        };

        $scope.closeDialog = function() {
            dialog.close($scope.phones);
        };

    });
}(angular));