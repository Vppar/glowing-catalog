(function(angular) {
    'use strict';

    angular.module('tnt.catalog.thirdparty', [
        'tnt.catalog.entity.service'
    ]).controller('ThirdPartyCtrl', ['$scope', 'EntityService', 'UserService', 'IntentService', '$location', function($scope, EntityService, UserService, IntentService, $location) {
        
        UserService.redirectIfIsNotLoggedIn();
        
        $scope.entities = EntityService.list().sort(function(x, y) {
            return ((x.name === y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
        });
        
        $scope.editEntity = function(uuid){
                IntentService.putBundle(uuid);
                $location.path('/add-customer');
        };
    }]);
}(angular));
