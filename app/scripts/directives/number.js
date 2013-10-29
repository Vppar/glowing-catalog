(function(angular) {
    'use strict';

    function removeNonDigit(value) {
        var number = value;
        if (number && !angular.isNumber(number)) {
            number = number.replace(/[^0-9]/g, '');
        }
        if (number == '') {
            return undefined;
        } else {
            return Number(number);
        }
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
                    
                    if (!number) {
                        ctrl.$pristine = true;
                        //do we recall?
                        if(ctrl.storedValue){
                            number = ctrl.storedValue;
                        } else {
                            number = 0;
                        }
                    }
                    return number;
                });

            }
        };
    });
}(angular));
