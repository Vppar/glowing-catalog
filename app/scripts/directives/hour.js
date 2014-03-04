(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').directive('hour', ['$filter', function phone($filter) {
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, ctrl) {

                ctrl.$formatters.unshift(function format(value) {
                    var hour = value;
                    if (hour) {
                        hour = $filter('hour')(hour);
                    }
                    return hour;
                });

                ctrl.$parsers.unshift(function(value) {

                    var clearHour = String(value.replace(/[^0-9]/g, ''));
                    
                    var hour = $filter('hour')(clearHour);

                    clearHour = String(hour.replace(/[^0-9]/g, ''));

                    ctrl.$viewValue = hour;
                    ctrl.$render();
                    
                    if(clearHour.length === 8){
                        ctrl.$setValidity('hour', true);
                    } else {
                        ctrl.$setValidity('hour', false);
                    }

                    return clearHour;
                });

            }
        };
    }]);
}(angular));
