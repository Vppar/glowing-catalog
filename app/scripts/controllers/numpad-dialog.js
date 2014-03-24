(function(angular) {
    'use strict';

    angular.module('tnt.catalog.dialog.numpad.ctrl', [
    ]).controller('NumpadDialogCtrl', ['$scope', '$q', 'dialog', function($scope, $q, dialog) {
        
        var initialValue = dialog.data && dialog.data.initial || 0;
        var relativeValue = dialog.data && dialog.data.relative || 0;
        var title = dialog.data && dialog.data.title;
        var message = dialog.data && dialog.data.message || null;

        var $parentScope = dialog.parentDialog && dialog.parentDialog.$scope;


        function getAbsoluteValue(value, relative) {
            return Math.round(100 * relative * (value / 100)) / 100;
        }

        $scope.title = title;
        $scope.message = message;

        $scope.value = initialValue || 0;

        $scope.setValue = function (key) {
            var response = false;

            switch(key) {
                case '%':
                    $scope.value = getAbsoluteValue($scope.value, relativeValue);
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
