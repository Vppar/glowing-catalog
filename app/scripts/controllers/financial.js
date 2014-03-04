'use strict';

angular.module('glowingCatalogApp').controller('FinancialCtrl', ['$scope', 'UserService', function($scope, UserService) {
    
    UserService.redirectIfIsNotLoggedIn();
    
    $scope.awesomeThings = [
        'HTML5 Boilerplate', 'AngularJS', 'Karma'
    ];
}]);
