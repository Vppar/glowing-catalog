(function(angular) {
    'use strict';

    function removeNonDigit(value) {
        var number = value;
        if (number) {
            number = number.replace(/[^0-9]/g, '');
        }
        return number;
    }

    angular.module('glowingCatalogApp').directive('number', function number() {
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, ctrl) {

                ctrl.$formatters.unshift(function format(value) {
                    return removeNonDigit(value);
                });

                ctrl.$parsers.unshift(function(value) {
                    var number = removeNonDigit(value);

                    ctrl.$viewValue = number;
                    ctrl.$render();

                    return number;
                });

            }
        };
    });
}(angular));
