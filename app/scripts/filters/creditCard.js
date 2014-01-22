(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').filter('creditCard', function() {
        return function(number, type) {
            if (!number) {
                return number;
            }
            
            if(type === 'amex'){
                if (number.length <= 4) {
                    
                } else if (number.length <= 10) {
                    number = number.substring(0, 4) + '-' + number.substring(4);
                } else {
                    number = number.substring(0, 4) + '-' + number.substring(4, 10) + '-' + number.substring(10, 15);
                }
                return number;
            } else {
                if (number.length <= 4) {
                    
                } else if (number.length <= 8) {
                    number = number.substring(0, 4) + '-' + number.substring(4);
                } else if (number.length <= 12) {
                    number = number.substring(0, 4) + '-' + number.substring(4, 8) + '-' + number.substring(8);
                } else {
                    number = number.substring(0, 4) + '-' + number.substring(4, 8) + '-' + number.substring(8, 12) + '-' + number.substring(12, 16);
                }
                return number;
            }
        };
    });
})(angular);