(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('AddCustomerEmailsDialogCtrl', function($scope, $filter, dialog) {

        $scope.email = {};
        $scope.email.address = dialog.email;
        $scope.emails = dialog.emails;

        $scope.addEmail = function addEmail(item) {
            if (item && item.address) {
                var emails= $filter('filter')($scope.emails, item.address);
                if (emails.length === 0) {
                    $scope.emails.push(angular.copy(item));
                    delete $scope.email;
                }
            }
        };

        $scope.moveUp = function moveUp(index) {
            var previous = $scope.emails[index - 1];
            var actual = $scope.emails[index];
            $scope.emails.splice(index - 1, 2, actual, previous);
        };

        $scope.moveDown = function moveDown(index) {
            var next = $scope.emails[index + 1];
            var actual = $scope.emails[index];
            $scope.emails.splice(index, 2, next, actual);
        };

        $scope.remove = function remove(index) {
            $scope.emails.splice(index, 1);
        };

        $scope.closeDialog = function() {
            dialog.close($scope.emails);
        };

    });
}(angular));