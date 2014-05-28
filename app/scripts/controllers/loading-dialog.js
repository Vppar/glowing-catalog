(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').controller('LoadingDialogCtrl', ['$scope', '$q', 'dialog', function($scope, $q, dialog) {

        console.log('Starting LoadingDialogCtrl...');

        $scope.title = dialog.data.title;
        $scope.message = dialog.data.message;
        $scope.btnYes = dialog.data.btnYes;
        $scope.btnNo = dialog.data.btnNo;

        $scope.confirm = function() {
            dialog.close(true);
        };
        $scope.cancel = function() {
            dialog.close($q.reject());
        };

    }]);
})(angular);
