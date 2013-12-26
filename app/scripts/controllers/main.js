(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').controller(
            'MainCtrl',
            function($scope, DataProvider) {

                $scope.lines = DataProvider.lines;
                
                $scope.$on('DataProvider.update', function(){
                    $scope.lines = DataProvider.lines;
                });
            });
}(angular));