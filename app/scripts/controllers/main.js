(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').controller('MainCtrl', function($scope, DataProvider, ArrayUtils) {

        $scope.sessions = ArrayUtils.distinct(DataProvider.products, 'session');
        $scope.lines = DataProvider.lines;

        $scope.$on('DataProvider.update', function() {
            $scope.lines = DataProvider.lines;
            $scope.sessions = ArrayUtils.distinct(DataProvider.products, 'session');
        });
        
        $scope.$watch('selectedSession', function(){
            
            var products = ArrayUtils.find(DataProvider.products, 'session', $scope.selectedSession);
            var lines = ArrayUtils.distinct(products, 'line');
            $scope.lines = ArrayUtils.isIn(DataProvider.lines, 'name', lines);
        });
        
        $scope.selectSession = function(session){
            $scope.selectedSession = session;
        };
    });
}(angular));