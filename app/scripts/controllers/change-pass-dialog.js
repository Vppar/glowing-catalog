(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('ChangePassDialogCtrl', function($scope, dialog) {
        $scope.closeDialog = function() {
            dialog.close();
        };

    });
}(angular));