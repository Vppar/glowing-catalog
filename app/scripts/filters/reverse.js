(function(angular) {
    'use strict';
    angular.module('tnt.catalog.filter.reverse', []).filter('reverse', function() {
        return function(items) {
            return items.slice().reverse();
          };
        });
})(angular);