(function(angular) {
    'use strict';

    angular.module('tnt.catalog.financial.incomeStatement', []).controller('IncomeStatementCtrl', ['$scope', 'UserService', function($scope, UserService) {
        
        UserService.redirectIfInvalidUser();
        
        $scope.dtInitial = new Date();
        $scope.dtInitial.setHours(0);
        $scope.dtInitial.setMinutes(0);
        $scope.dtInitial.setSeconds(0);
        
        $scope.dtFinal = new Date();
        $scope.dtFinal.setHours(23);
        $scope.dtFinal.setMinutes(59);
        $scope.dtFinal.setSeconds(59);
        
        $scope.dtFinalTime = $scope.dtFinal.getTime();
    }]);
}(angular));