(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').controller('MainCtrl', function($scope, DataProvider, ArrayUtils) {

        $scope.sections = ArrayUtils.distinct(DataProvider.products, 'session');

        $scope.$on('DataProvider.update', function() {
            $scope.sections = ArrayUtils.distinct(DataProvider.products, 'session');
        });
        
        $scope.$watch('selectedSection', function(val){
            var products = ArrayUtils.find(DataProvider.products, 'session', val);
            var lines = ArrayUtils.distinct(products, 'line');
            $scope.lines = ArrayUtils.isIn(DataProvider.lines, 'name', lines);
        });
        
        $scope.selectSection = function(section){
            $scope.selectedSection = section;
        };
    });
}(angular));