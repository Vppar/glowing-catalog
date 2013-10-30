(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('CustomerInfoDialogCtrl', function($scope, dialog) {

        $scope.customer = dialog.data.customer;

        $scope.closeDialog = function() {
            dialog.close();
        };

    });
}(angular));