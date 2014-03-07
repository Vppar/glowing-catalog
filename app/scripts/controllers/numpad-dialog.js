(function(angular) {
    'use strict';

    angular.module('tnt.catalog.dialog.numpad.ctrl', [
    ]).controller('NumpadDialogCtrl', ['$scope', '$q', 'dialog', function($scope, $q, dialog) {

        var $parentScope = dialog.parentDialog.$scope;

        $scope.value = $parentScope.specificDiscount || 0;

        $scope.parent = $parentScope;

        /**
         * Closes the dialog, rejecting the value
         */
        $scope.cancel = function() {
            dialog.close($q.reject());
        };

        /**
         * Closes the dialog with the value from the numpad input
         */
        $scope.confirm = function() {
            dialog.close($scope.value);
        };

    }]);
}(angular));
