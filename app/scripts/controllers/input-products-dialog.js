(function(angular) {
    'use strict';

    angular.module('tnt.catalog.product.input.dialog', []).controller('InputProductsCtrl', function($scope, dialog) {

        $scope.closeDialog = function() {
            dialog.close();
        };
    });
}(angular));