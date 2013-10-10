(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').filter('obInject', function() {
        return function(array, op, a, b, out) {
            for ( var ix in array) {
                var input = array[ix];
                if (op === 'add') {
                    input[out] = input[a] + input[b];
                } else if (op === 'sub') {
                    input[out] = input[a] - input[b];
                } else if (op === 'mul') {
                    input[out] = input[a] * input[b];
                } else if (op === 'div') {
                    input[out] = input[a] / input[b];
                }
            }
            return array;
        };
    });
})(angular);
