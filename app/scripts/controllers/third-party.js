(function(angular) {
    'use strict';

    angular.module('tnt.catalog.thirdparty', [
        'tnt.catalog.entity.service'
    ]).controller(
            'ThirdPartyCtrl',
            [
                '$scope', 'EntityService', 'UserService', 'IntentService', '$location', '$filter',
                function($scope, EntityService, UserService, IntentService, $location, $filter) {

                    UserService.redirectIfIsNotLoggedIn();

                    $scope.newClient = function() {
                        IntentService.putBundle({
                            clientName : $scope.searchClient
                        });
                        $location.path('/add-customer');

                    };

                    $scope.entities = EntityService.list().sort(function(x, y) {
                        return ((x.name === y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
                    });

                    $scope.$watchCollection('searchClient', function() {
                        $scope.filteredEntities = $filter('filter')($scope.entities, $scope.searchClient);
                    });

                    $scope.$watchCollection('entities', function() {
                        for ( var ix in $scope.entities) {
                            if ($scope.entities[ix].birthDate && $scope.entities[ix].birthDate.day && $scope.entities[ix].birthDate.month) {
                                var day = $scope.entities[ix].birthDate.day;
                                var month = $scope.entities[ix].birthDate.month;
                                $scope.entities[ix].birthDate.formated = day + '/' + month;
                            } else {
                                $scope.entities[ix].birthDate = {
                                    formated : ''
                                };
                            }
                        }
                    });

                    $scope.editEntity = function(uuid) {
                        IntentService.putBundle({
                            editUuid : uuid
                        });
                        $location.path('/add-customer');
                    };
                }
            ]);
}(angular));
