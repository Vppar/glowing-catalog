(function(angular) {
    'use strict';
    function lowerCase($filter) {
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, ctrl) {

                ctrl.$parsers.unshift(function(value) {
                    value = $filter('lowercase')(value);
                    ctrl.$viewValue = value;
                    ctrl.$render();
                    return value;
                });
            }
        };
    }
    angular.module('tnt.catalog.attrs.lowerCase', []).directive('lowerCase', ['$filter', lowerCase]);
}(angular));
