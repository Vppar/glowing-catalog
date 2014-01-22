(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').filter('cpf', function() {
        return function(cpf) {
            if (!cpf) {
                return cpf;
            }

            if (cpf.length <= 3) {
                
            } else if (cpf.length <= 6) {
                cpf = cpf.substring(0, 3) + '.' + cpf.substring(3);
            } else if (cpf.length <= 9) {
                cpf = cpf.substring(0, 3) + '.' + cpf.substring(3, 6) + '.' + cpf.substring(6);
            } else {
                cpf = cpf.substring(0, 3) + '.' + cpf.substring(3, 6) + '.' + cpf.substring(6, 9) + '-' + cpf.substring(9, 11);
            }
            return cpf;
        };
    });
})(angular);