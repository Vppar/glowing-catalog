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
            link : function postLink(scope, element, attr) {

                var min, max, value, input = element.find('input');

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

                value = scope.value;

                function propagate() {
                    input.val(value);
                    scope.$apply('value = ' + value);
                }
                setTimeout(propagate, 0);

                var dec = element.find('.ic-arrow-left');
                dec.bind('tap', function() {
                    if (value > min) {
                        value--;
                        propagate();
                    }
                });

                var inc = element.find('.ic-arrow-right');
                inc.bind('tap', function() {
                    if (value < max) {
                        value++;
                        propagate();
                    }
                });
            }
        };
    });
}(angular));