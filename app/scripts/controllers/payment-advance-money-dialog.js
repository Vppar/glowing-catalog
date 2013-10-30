'use strict';

angular.module('glowingCatalogApp').controller('CustomerDialogCtrl', function($scope, dialog) {

    $scope.closeDialog = function() {
        dialog.close();
    };

});
