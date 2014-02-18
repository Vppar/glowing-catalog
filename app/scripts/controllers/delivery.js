'use strict';

angular.module('glowingCatalogApp').controller('DeliveryCtrl', function($scope, UserService) {
    
    UserService.redirectIfIsNotLoggedIn();
    
    $scope.awesomeThings = [
        'HTML5 Boilerplate', 'AngularJS', 'Karma'
    ];
});
