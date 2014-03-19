(function (angular) {
    'use strict';

    var templateUrl = 'components/tnt-number-picker/tnt-number-picker.html';

    angular.module('tnt.catalog.components.numberPicker', []).directive('tntNumberPicker', [
        function () {
            return {
                templateUrl : templateUrl,
                restrict : 'E',
                replace : true,
                scope : {
                    value: '=ngModel'
                },
                link : function postLink (scope, element, attrs) {

                    scope.sufix = attrs.sufix;
                    
                    if(!scope.value){
                        scope.value = Number(attrs.min) || 0;
                    }

                    var step = Number(attrs.step) || 1;
                    
                    scope.add = function () {
                        if(!attrs.max || (scope.value + step) <= attrs.max){
                            scope.value += step;
                        }
                    };

                    scope.sub = function () {
                        if(!attrs.min || (scope.value - step) >= attrs.min){
                            scope.value -= step;
                        }
                    };
                }
            };
        }
    ]);
}(angular));
