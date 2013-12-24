(function(angular, ObjectUtils) {
    'use strict';

    angular.module('tnt.utils.array', []).factory('FilteredArray', function FilteredArray() {

        var service = function() {

            var that = this;

            var keyNames = arguments;

            var filter = function(array, property, value) {

                var response = [];

                for ( var idx in array) {
                    var item = array[idx];

                    if (angular.isUndefined(item) || angular.isFunction(item)) {
                        continue;
                    }

                    if (item[property] === value) {
                        response.push(item);
                    }
                }
                return response;
            };

            this.distinct = function(property) {

                var response = [];

                for ( var idx in this) {

                    var item = this[idx];

                    if (angular.isUndefined(item) || angular.isFunction(item)) {
                        continue;
                    }

                    if (response.indexOf(item[property]) === -1) {
                        response.push(item[property]);
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

            this.mPush = function(data) {

                if (!angular.isArray(data)) {
                    throw "Only arrays are allowed";
                }

                for ( var ix in data) {
                    that.push(data[ix]);
                }
            };
            
            this.getArray = function getArray(){
                var response = [];
                for ( var ix in this) {
                    if(!isNaN(new Number(ix))){
                        response.push(this[ix]);
                    }
                }
                return response;
            };
        };

        ObjectUtils.inherit(service, Array);

        return service;
    });
})(angular, ObjectUtils);
