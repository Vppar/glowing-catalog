(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('ChangePassDialogCtrl', ['$scope', 'dialog', function($scope, dialog) {
        $scope.closeDialog = function() {
            dialog.close();
        };

    }]);
}(angular));