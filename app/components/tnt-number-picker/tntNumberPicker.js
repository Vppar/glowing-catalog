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
                    
                    if(!scope.value){
                        scope.value = Number(attrs.min) || 0;
                    }
                    
                    scope.add = function () {
                        if(!attrs.max || scope.value < attrs.max){
                            scope.value ++;
                        }
                    };

                    scope.sub = function () {
                        if(!attrs.min || scope.value > attrs.min){
                            scope.value --;
                        }
                    };
                }
            };
        }
    ]);
}(angular));