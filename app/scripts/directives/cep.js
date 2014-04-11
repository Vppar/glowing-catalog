(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').directive('cep', [function cep() {
        return {
            require : 'ngModel',
            scope: {
               cep: "="
            },
            link : function(scope, element, attrs, ctrl) {

                ctrl.$formatters.unshift(function format(value) {
                    var cepValue = value;
                    if (cepValue) {
                        cepValue = value.replace(/[^0-9]/g, '');
                        if (cepValue.length > 5) {
                            if (cepValue.length <= 8) {
                                cepValue = cepValue.substring(0, 5) + '-' + cepValue.substring(5);
                            } else {
                                cepValue = cepValue.substring(0, 5) + '-' + cepValue.substring(5, 8);
                            }
                        }
                        if(cepValue.length === 9){
                           scope.cep = true;
                        }else{
                           scope.cep = false;
                        }
                    }
                    return cepValue;
                });

                ctrl.$parsers.unshift(function(value) {
                    var cepValue = value.replace(/[^0-9]/g, '');
                    if (cepValue.length > 5) {
                        if (cepValue.length <= 8) {
                            cepValue = cepValue.substring(0, 5) + '-' + cepValue.substring(5);
                        } else {
                            cepValue = cepValue.substring(0, 5) + '-' + cepValue.substring(5, 8);
                        }
                    }

                    ctrl.$viewValue = cepValue;
                    ctrl.$render();
                    if(cepValue.length === 9){
                        scope.cep = true;
                    }else{
                        scope.cep = false;
                    }
                    return cepValue.replace(/[^0-9]/g, '');
                });

            }
        };
    }]);
}(angular));
