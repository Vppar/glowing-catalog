(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('CustomerInfoDialogCtrl', function($scope, dialog) {

        $scope.closeDialog = function() {
            dialog.close();
        };

    });
}(angular));