'use strict';

angular.module('glowingCatalogApp').controller('DeliveryCtrl', ['$scope', 'UserService', function($scope, UserService) {
    
    UserService.redirectIfInvalidUser();
    
    $scope.awesomeThings = [
        'HTML5 Boilerplate', 'AngularJS', 'Karma'
    ];
}]);
