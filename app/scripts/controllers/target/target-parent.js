(function (angular) {
    'use strict';
    angular.module('tnt.catalog.target.parent.ctrl', []).controller(
        'TargetParentCtrl',
        [
            '$scope', '$location', 'Target', 'TargetService', 'UserService', 'FinancialMathService', 'Misplacedservice', 'IntentService',
            function ($scope, $location, Target, TargetService, UserService, FinancialMathService, Misplacedservice, IntentService) {

                UserService.redirectIfIsNotLoggedIn();

                $scope.tabs = {selected : 'new'};


                $scope.intent = IntentService.getBundle();

                $scope.uuidTarget = null;

                $scope.edit = false;

                $scope.targetIntervals = null;

                if($scope.intent){
                    $scope.targetEdit = TargetService.findTarget($scope.intent.editTarget);
                    $scope.edit = true;
                }

                $scope.selectTab = function selectTab(tabName) {
                    $scope.tabs.selected = tabName;
                };


            }
        ]);
})(angular);
