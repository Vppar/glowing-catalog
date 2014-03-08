(function(angular) {
    'use strict';
    function customerName($filter) {
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, ctrl) {
                
                ctrl.$parsers.unshift(function(value) {
                    var splitedValue = value.split(' ');
                    for ( var i in splitedValue) {
                        var firstLetter = splitedValue[i].charAt(0);
                        if ((firstLetter === 'd' || firstLetter === 'D') && !(splitedValue[i].length > 2)) {
                            splitedValue[i] = firstLetter.toLowerCase() + splitedValue[i].substring(1).toLowerCase();
                        } else {
                            splitedValue[i] = firstLetter.toUpperCase() + splitedValue[i].substring(1).toLowerCase();
                        }
                    }
                    ctrl.$viewValue = splitedValue.join(' ');
                    ctrl.$render();
                    return value;
                });
            }
        };
    }
    angular.module('tnt.catalog.attrs.customerName', []).directive('customerName', [
        '$filter', customerName
    ]);
}(angular));