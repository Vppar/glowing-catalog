(function(angular) {
    'use strict';

    angular.module('tnt.catalog.dialog.numpad.ctrl', [
    ]).controller('NumpadDialogCtrl', ['$scope', '$q', 'dialog', function($scope, $q, dialog) {

        var $parentScope = dialog.parentDialog.$scope;


        function getAbsoluteValue(value, relative) {
            return Math.round(100 * relative * (value / 100)) / 100;
        }


        $scope.value = $parentScope.itemDiscount || 0;


        $scope.setDiscount = function (key) {
            var response = false;

            switch(key) {
                case '%':
                    $scope.value = getAbsoluteValue($scope.value, $parentScope.total);
                    break;
                case 'enter':
                    confirm();
                    break;
                default:
                    response = true;
            }

            return response;
        };


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
        function confirm() {
            dialog.close($scope.value);
        };

    }]);
}(angular));
