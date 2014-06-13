(function (angular) {
    'use strict';
    angular.module('tnt.catalog.target.parent.ctrl', []).controller(
        'TargetParentCtrl',
        [
            '$scope', 'Target', 'TargetService', 'UserService', 'IntentService',
            function ($scope, Target, TargetService, UserService, IntentService) {

                UserService.redirectIfIsNotLoggedIn();

                $scope.intent = IntentService.getBundle();

                $scope.selectedTarget = {
                    uuid : null
                };

                $scope.editable = {select : false};

                $scope.targetIntervals = null;

                if($scope.intent){
                    $scope.targetEdit = TargetService.findTarget($scope.intent.editTarget);
                    $scope.selectedTarget.uuid = $scope.targetEdit.uuid;

                    $scope.editable.select = true;

                    $scope.tabs = {selected : 'analytics'};
                }else{
                    $scope.tabs = {selected : 'new'};
                }

                $scope.selectTab = function selectTab(tabName) {
                    if($scope.editable.select===false && tabName==='analytics'){
                        //don't change
                    }else{
                        $scope.tabs.selected = tabName;
                    }
                };


            }
        ]);
})(angular);
