(function(angular) {
    'use strict';
    angular.module('tnt.catalog.filter.sum', []).filter('sum', function() {
        return function(array, property, qtd) {
            var value = 0;

            for ( var ix in array) {
                if (array[ix][property]) {
                    if (qtd && array[ix][qtd]) {
                        value += (Number(array[ix][property]) * array[ix][qtd]);
                    } else {
                        value += Number(array[ix][property]);
                    }
                }
            }
            return value;
        };
    });
})(angular);