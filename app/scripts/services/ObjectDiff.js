(function(angular) {
    'use strict';

    angular.module('tnt.utils.object', []).service('ObjectDiff', function ObjectDiff() {

        // Properties that have been added
        var added = function(o1, o2) {

            var diff = {};

            for ( var ix in o2) {

                var old = o1[ix];
                var cur = o2[ix];

                if (angular.isUndefined(old) && !angular.isFunction(cur)) {
                    diff[ix] = cur;
                }
            }

            return diff;
        };

        // Properties that have been removed
        var removed = function(o1, o2) {
            var diff = {};

            for ( var ix in o1) {

                var old = o1[ix];
                var cur = o2[ix];

                if (angular.isUndefined(cur) && !angular.isFunction(old)) {
                    diff[ix] = null;
                }
            }

            return diff;
        };

        // Properties that have been updated
        var updated = function(o1, o2) {
            var diff = {};

            for ( var ix in o2) {

                var old = o1[ix];
                var cur = o2[ix];

                if (!angular.equals(old, cur)) {
                    diff[ix] = cur;
                }
            }

            return diff;
        };

        this.shallow = function(o1, o2) {
            var diff = {};

            if (!angular.isObject(o1) || !angular.isObject(o2)) {
                throw "Both operands must be objects";
            }

            angular.extend(diff, added(o1, o2));
            angular.extend(diff, removed(o1, o2));
            angular.extend(diff, updated(o1, o2));
            return diff;

        };

        this.deep = function(outdated, updated) {
            
        };

    });
})(angular);
