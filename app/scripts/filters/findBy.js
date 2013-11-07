(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').filter('findBy', function() {
        /**
         * Find the first item in the array that the property is an exact match
         * of the informed property. If not found return an empty object.
         */
        return function(array, property, value) {
            for ( var idx in array) {
                var item = array[idx];
                if (item[property] === value) {
                    return item;
                }
            }
            return {};
        };
    });
})(angular);