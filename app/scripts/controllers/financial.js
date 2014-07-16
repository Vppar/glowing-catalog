'use strict';

angular.module('glowingCatalogApp').controller('FinancialCtrl', ['$scope', 'UserService', function($scope, UserService) {
    
    UserService.redirectIfInvalidUser();
    
    $scope.awesomeThings = [
        'HTML5 Boilerplate', 'AngularJS', 'Karma'
    ];
}]);
