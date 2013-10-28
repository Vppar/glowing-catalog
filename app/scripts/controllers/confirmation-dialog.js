(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').controller('ConfirmationDialogCtrl', function($scope, $q, dialog) {

        $scope.title = dialog.data.title;
        $scope.message = dialog.data.message;

        $scope.confirm = function() {
            dialog.close();
        };
        $scope.cancel = function() {
            dialog.close($q.reject());
        };

    });
})(angular);
