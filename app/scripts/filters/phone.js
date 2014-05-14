(function(angular) {
    'use strict';

    angular.module('tnt.catalog.filter.phone', []).filter('phone', function() {
        return function(phone) {
            if (!phone) {
                return phone;
            }

            if (phone.length === 0) {

            } else if (phone.length <= 2) {
                phone = '(' + phone;
            } else if (phone.length <= 6) {
                phone = '(' + phone.substring(0, 2) + ') ' + phone.substring(2);
            } else if (phone.length <= 10) {
                phone = '(' + phone.substring(0, 2) + ') ' + phone.substring(2, 6) + '-' + phone.substring(6);
            } else if (phone.length === 11) {
                phone = '(' + phone.substring(0, 2) + ') ' + phone.substring(2, 7) + '-' + phone.substring(7);
            } else {
                phone = '(' + phone.substring(0, 2) + ') ' + phone.substring(2, 7) + '-' + phone.substring(7, 11);
            }
            return phone;
        };
    });
})(angular);