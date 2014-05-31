(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').controller('LoadingDialogCtrl', ['$scope', '$q', 'dialog', function($scope, $q, dialog) {

        $scope.step = dialog.data.step;

        $scope.cancel = function() {
            dialog.close($q.reject());
        };

    }]);
})(angular);
