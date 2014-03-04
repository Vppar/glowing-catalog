(function(angular) {
    'use strict';
    function upperCase($filter) {
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, ctrl) {

                ctrl.$parsers.unshift(function(value) {
                    value = $filter('uppercase')(value);
                    ctrl.$viewValue = value;
                    ctrl.$render();
                    return value;
                });
            }
        };
    }
    angular.module('tnt.catalog.attrs.upperCase', []).directive('upperCase', ['$filter', upperCase]);
}(angular));
