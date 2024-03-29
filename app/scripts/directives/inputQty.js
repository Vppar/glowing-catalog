(function(angular) {
    'use strict';

    var templateUrl = 'views/parts/catalog/input-qty.html';

    angular.module('glowingCatalogApp').run(['$http', '$templateCache', function($http, $templateCache) {
        $http.get(templateUrl, {
            cache : $templateCache
        });
    }]);

    angular.module('glowingCatalogApp').directive('inputQty', ['TimerService', function(TimerService) {
        return {
            restrict : 'E',
            scope : {
                value : '=ngModel',
                min : '@',
                max : '@'
            },
            templateUrl : templateUrl,
            link : function postLink(scope, element) {

                var min, max, value, qty = element.find('.qty');

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
                
                scope.$watch('value', function() {
                    qty.html(scope.value);
                    value = scope.value;
                });

                if (scope.value === undefined) {
                    scope.value = 1;
                }

                value = scope.value;

                function propagate() {
                    var id = 'inputQty:' + Math.random();
                    TimerService.startTimer(id,'propagate changes');
                    scope.$apply('value = ' + value);
                    TimerService.stopTimer(id);
                }

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
    }]);
}(angular));