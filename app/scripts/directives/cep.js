(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').directive('cep', function cep() {
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, ctrl) {

                ctrl.$formatters.unshift(function format(value) {
                    var cep = value;
                    if (cep) {
                        cep = value.replace(/[^0-9]/g, '');
                    }
                    return cep;
                });

                ctrl.$parsers.unshift(function(value) {
                    var cep = value.replace(/[^0-9]/g, '');
                    if (cep.length > 5) {
                        if (cep.length <= 8) {
                            cep = cep.substring(0, 5) + '-' + cep.substring(5);
                        } else {
                            cep = cep.substring(0, 5) + '-' + cep.substring(5, 8);
                        }
                    }

                    ctrl.$viewValue = cep;
                    ctrl.$render();

                    return cep.replace(/[^0-9]/g, '');
                });

            }
        };
    });
}(angular));
