(function(angular) {
    'use strict';

    var templateUrl = 'views/parts/catalog/input-qty.html';

    angular.module('glowingCatalogApp').run(function($http, $templateCache) {
        $http.get(templateUrl, {
            cache : $templateCache
        });
    });

    angular.module('glowingCatalogApp').directive('inputQty', function() {
        return {
            restrict : 'E',
            scope : {
                value : '=ngModel',
                min : '@',
                max : '@'
            },
            templateUrl : templateUrl,
            link : function postLink(scope, element, attrs) {

                scope.$watch('max', function() {
                    if (!scope.min || scope.min === '') {
                        scope.min = 0;
                    } else {
                        scope.min = Number(scope.min);
                    }
                });

                scope.$watch('max', function() {
                    if (!scope.max || scope.max === '') {
                        scope.max = 999;
                    } else {
                        scope.max = Number(scope.max);
                    }
                });

                if (!scope.value) {
                    scope.value = 1;
                }

                scope.increment = function() {
                    if (scope.value < scope.max) {
                        scope.value = (Number(scope.value) + 1).toString();
                    }
                };

                scope.decrement = function() {
                    if (scope.value > scope.min) {
                        scope.value = (Number(scope.value) - 1).toString();
                    }
                };
            }
        };
    });
}(angular));