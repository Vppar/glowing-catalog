(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').filter('truncate', function() {
        return function(input, length) {
            if (!input) {
                return input;
            }
            var string = String(input);
            if (string.length > length) {
                string = string.slice(0, length - 2) + '...';
            }
            return string;
        };
    });
})(angular);
