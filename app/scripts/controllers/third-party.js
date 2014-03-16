(function(angular) {
    'use strict';

    angular.module('tnt.catalog.thirdparty', [
        'tnt.catalog.entity.service'
    ]).controller('ThirdPartyCtrl', ['$scope', 'EntityService', 'UserService', function($scope, EntityService, UserService) {
        
        UserService.redirectIfIsNotLoggedIn();
        
        $scope.entities = EntityService.list().sort(function(x, y) {
            return ((x.name === y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
        });
    }]);
}(angular));
