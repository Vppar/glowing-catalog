(function(angular) {
    'use strict';
    function creditCard($filter) {
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, ctrl) {

                var config = {};

                attrs.$observe('creditCard', function(val) {
                    config.type = val;
                });
                ctrl.$parsers.unshift(function(value) {
                    value = String(value.replace(/[^0-9]/g, ''));
                    var fmt = $filter('creditCard')(value, config.type);

                    var cardNumberLength = config.type === 'amex' ? 17 : 19;
                    if (fmt && fmt.length === cardNumberLength) {
                        ctrl.$setValidity('creditCard', true);
                    } else {
                        ctrl.$setValidity('creditCard', false);
                    }

                    ctrl.$viewValue = fmt;
                    ctrl.$render();
                    return value;
                });
                ctrl.$formatters.unshift(function(value) {
                    var fmt = $filter('creditCard')(value, config.type);
                    return fmt;
                });
            }
        };
    }
    angular.module('glowingCatalogApp').directive('creditCard', ['$filter', creditCard]);
}(angular));
