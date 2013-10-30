(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').filter('sum', function() {
        return function(array, property, qtd) {
            var value = 0;

            for ( var ix in array) {
                if (qtd) {
                    value += (Number(array[ix][property]) * array[ix][qtd]);
                } else {
                    value += Number(array[ix][property]);
                }
            }
            return value;
        };
    });
})(angular);
