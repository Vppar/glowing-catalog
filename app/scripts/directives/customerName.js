(function(angular) {
    'use strict';
    function customerName($filter) {
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, ctrl) {
                
                element.bind('blur', function(){
                    var splitedValue = element.val().split(' ');
                    for ( var i in splitedValue) {
                        var firstLetter = splitedValue[i].charAt(0);
                        if ((firstLetter === 'd' || firstLetter === 'D') && !(splitedValue[i].length > 2)) {
                            splitedValue[i] = firstLetter.toLowerCase() + splitedValue[i].substring(1).toLowerCase();
                        } else {
                            splitedValue[i] = firstLetter.toUpperCase() + splitedValue[i].substring(1).toLowerCase();
                        }
                    }
                    element.val(splitedValue.join(' '));
                    element.trigger('input');
                });
            }
        };
    }
    angular.module('tnt.catalog.attrs.customerName', []).directive('customerName', [
        '$filter', customerName
    ]);
}(angular));