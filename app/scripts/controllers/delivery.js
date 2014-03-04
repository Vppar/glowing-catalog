'use strict';

angular.module('glowingCatalogApp').controller('DeliveryCtrl', ['$scope', 'UserService', function($scope, UserService) {
    
    UserService.redirectIfIsNotLoggedIn();
    
    $scope.awesomeThings = [
        'HTML5 Boilerplate', 'AngularJS', 'Karma'
    ];
}]);
