(function (angular) {
    'use strict';
    angular.module('tnt.catalog.target.parent.ctrl', []).controller(
        'TargetParentCtrl',
        [
            '$scope', '$location', 'Target', 'TargetService', 'UserService', 'FinancialMathService', 'Misplacedservice', 'IntentService',
            function ($scope, $location, Target, TargetService, UserService, FinancialMathService, Misplacedservice, IntentService) {

                UserService.redirectIfIsNotLoggedIn();

                $scope.tabs = {selected : 'new'};
                


                $scope.selectTab = function selectTab(tabName) {
                    $scope.tabs.selected = tabName;
                };


            }
        ]);
})(angular);
