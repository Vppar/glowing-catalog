(function(angular) {
    'use strict';
    function upperCase($filter) {
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, ctrl) {

                ctrl.$parsers.unshift(function(value) {
                    console.log('ta pasando aqui?');
                    value= $filter('uppercase')(value);
                    ctrl.$viewValue = value;
                    ctrl.$render();
                    return value;
                });
            }
        };
    }
    angular.module('glowingCatalogApp').directive('upperCase', upperCase);
}(angular));
