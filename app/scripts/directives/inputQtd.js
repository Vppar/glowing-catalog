(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').directive('inputQtd', function() {
        return {
            restrict : 'E',
            scope : {
                value : '=ngModel'
            },
            templateUrl : 'views/input-qtd.html',
            link : function postLink(scope, element, attrs) {
                if(!scope.value){
                    scope.value = 0;
                }

                scope.increment = function() {
                    scope.value = String(Number(scope.value) + 1);
                };

                scope.decrement = function() {
                    if (scope.value > 0) {
                        scope.value = String(Number(scope.value) - 1);
                    }
                };
            }
        };
    });
}(angular));