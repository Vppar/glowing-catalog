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
                    
                    var validLength = 8;
                    if(attrs.hourFormat && attrs.hourFormat === 'HH:mm'){
                        validLength = 4;
                    }
                    
                    if(clearHour.length === validLength){
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
