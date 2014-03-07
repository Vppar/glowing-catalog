(function(angular) {
    'use strict';
    function cpf($filter) {
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, ctrl) {

                ctrl.$parsers.unshift(function(value) {

                    value = String(value.replace(/[^0-9]/g, ''));
                    var fmt = $filter('cpf')(value);
                    ctrl.$viewValue = fmt;
                    ctrl.$render();
                    return value;
                });
                ctrl.$formatters.unshift(function(value) {
                    var fmt = $filter('cpf')(value);
                    return fmt;
                });
            }
        };
    }
    angular.module('glowingCatalogApp').directive('cpf', ['$filter', cpf]);
}(angular));
