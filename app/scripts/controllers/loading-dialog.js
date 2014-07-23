(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').controller('LoadingDialogCtrl', ['$scope', '$q', 'dialog', function($scope, $q, dialog) {

        $scope.progress = dialog.data.progress;

        $scope.cancel = function() {
            dialog.close($q.reject());
        };

    }]);
})(angular);
