(function(angular, ObjectUtils) {
    'use strict';

    angular.module('tnt.utils.array', []).service('ArrayUtils', function ArrayUtils() {

        /**
         * TODO Lacks tests
         * 
         * @param array - the array to be searched(must be an array of objects)
         * @param property - the property we are looking for
         * @param value - the value the property must have to be included in the filter
         * 
         * @return []
         */
        this.find = function(array, property, value) {

            var response = [];

            for ( var idx in array) {
                var item = array[idx];

                if (!angular.isObject(item)) {
                    continue;
                }

                if (item[property] === value) {
                    response.push(item);
                }
            }
            return response;
        };

        this.distinct = function(array, property) {

            var response = [];

            for ( var idx in array) {

                var item = array[idx];

                if (!angular.isObject(item)) {
                    continue;
                }

                if (response.indexOf(item[property]) === -1) {
                    response.push(item[property]);
                }
            }
            return response;
        };

        this.filter = function(array, filters) {

            var response = array;

            for ( var keyName in filters) {
                response = this.find(response, keyName, filters[keyName]);
            }

            return response;
        };

    });
})(angular, ObjectUtils);
