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
        
        this.isIn = function(array, property, ids) {

            var response = [];

            for ( var idx in array) {
                var item = array[idx];

                if (!angular.isObject(item)) {
                    continue;
                }

                if (ids.indexOf(item[property]) !== -1) {
                    response.push(item);
                }
            }
            return response;
        };
        
        this.innerJoin = function(a1, a2, on) {

            var a1f = [];
            var a2f = [];
            
            for ( var idx1 in a1) {
                if (angular.isObject(a1[idx1]) && a1[idx1][on] !== undefined) {
                    a1f.push(a1[idx1]);
                }
            }
            
            for ( var idx2 in a2) {
                if (angular.isObject(a2[idx2]) && a2[idx2][on] !== undefined) {
                    a2f.push(a2[idx2]);
                }
            }
                        
            var response = [];

            for ( var idx1 in a1f) {
                var item1 = a1f[idx1];

                for ( var idx2 in a2f) {
                    var item2 = a2f[idx2];
                    
                    if(item1[on] === item2[on]){
                        var obj = {};
                        angular.extend(obj, item1, item2);
                        response.push(obj);
                    }
                }
            }
            return response;
        };

    });
})(angular, ObjectUtils);
