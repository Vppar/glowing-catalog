(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').controller('ConfirmationDialogCtrl', function($scope, dialog) {
        
        $scope.title = dialog.data.title;
        $scope.message = dialog.data.message;

        $scope.closeDialog = function(result) {
            dialog.close(result);
        };
    });
})(angular);
