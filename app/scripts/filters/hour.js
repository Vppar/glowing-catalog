(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').filter('hour', function() {
        return function(hour) {
            if (!hour) {
                return hour;
            }
            hour = ('' + hour).replace(':', '');
            if (hour.length <= 2) {
            } else {
                var hh = hour.substring(0, 2);
                var mm = hour.substring(2, 4);
                hh = hh > 23 ? 23 : hh;
                mm = mm > 59 ? 59 : mm;
                hour = hh + ':' + mm;
            }
            return hour;
        };
    });
})(angular);