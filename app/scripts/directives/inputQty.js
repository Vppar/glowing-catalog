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

                var min, max;

                scope.$watch('min', function() {
                    if (!scope.min || scope.min === '') {
                        min = 1;
                    } else {
                        min = Number(scope.min);
                    }
                });

                scope.$watch('max', function() {
                    if (!scope.max || scope.max === '') {
                        max = 999;
                    } else {
                        max = Number(scope.max);
                    }
                });

                if (!scope.value) {
                    scope.value = 1;
                }

                scope.increment = function() {
                    if (scope.value < max) {
                        scope.value = (Number(scope.value) + 1).toString();
                    }
                };

                scope.decrement = function() {
                    if (scope.value > min) {
                        scope.value = (Number(scope.value) - 1).toString();
                    }
                };
            }
        };
    });
}(angular));