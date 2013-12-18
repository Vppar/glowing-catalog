(function(angular, ObjectUtils) {
    'use strict';

    angular.module('tnt.utils.array', []).factory('FilteredArray', function FilteredArray() {

        var service = function() {

            var keyNames = arguments;

            var filter = function(array, property, value) {

                var response = [];

                for ( var idx in array) {
                    var item = array[idx];
                    if (item[property] === value) {
                        response.push(item);
                    }
                }
                return response;
            };

            this.find = function() {

                var response = this;

                for ( var ix in keyNames) {
                    if (arguments[ix] !== undefined) {
                        response = filter(response, keyNames[ix], arguments[ix]);
                    }
                }

                return response;
            };
        };

        ObjectUtils.inherit(service, Array);

        return service;
    });
})(angular, ObjectUtils);
