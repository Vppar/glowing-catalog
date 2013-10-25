(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('DeliveryDetailsDialogCtrl', function($scope, dialog) {

        $scope.closeDialog = function() {
            dialog.close();
        };
    });
}(angular));