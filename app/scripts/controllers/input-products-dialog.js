'use strict';

angular.module('glowingCatalogApp').controller('InputProductsCtrl', function($scope, dialog) {

    $scope.closeDialog = function() {
        dialog.close();
    };
});
