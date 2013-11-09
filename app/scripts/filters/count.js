(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').filter('count', function() {
        return function(array, property) {
            var value = 0;
            for ( var ix in array) {
                if (Boolean(array[ix][property])) {
                    value++;
                }
            }
            return value;
        };
    });
})(angular);
