(function (angular) {
    'use strict';

    angular.module('tnt.catalog.goalposter.editDialog', []).controller('GoalPosterEditDialogCtrl', ['$scope', '$q', 'dialog', function ($scope, $q, dialog) {

        $scope.goal = {
            name: dialog.data.name,
            deadline: dialog.data.deadline
        };

        $scope.confirm = function () {
            return dialog.close($scope.goal);
        };

        $scope.cancel = function () {
            dialog.close($q.reject());
        };
    }]);
})(angular);
