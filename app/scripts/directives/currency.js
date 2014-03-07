(function(angular) {
    'use strict';
    function currency($filter) {
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, ctrl) {

                ctrl.$parsers.unshift(function(value) {

                    value = String(value.replace(/[^0-9]/g, ''));
                    var fmt = $filter('currency')(value / 100, '');
                    ctrl.$viewValue = fmt;
                    ctrl.$render();
                    value = Number(value);
                    return value / 100;
                });
                ctrl.$formatters.unshift(function(value) {
                    var fmt = $filter('currency')(value, '');
                    return fmt;
                });
            }
        };
    }
    angular.module('glowingCatalogApp').directive('currencyInput', ['$filter', currency]);
    angular.module('glowingCatalogApp').directive('currency', ['$filter', currency]);
}(angular));
