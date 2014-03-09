(function(angular) {
    'use strict';
    function cpf($filter, CpfService) {
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, ctrl) {

                ctrl.$parsers.unshift(function(value) {

                    value = String(value.replace(/[^0-9]/g, ''));
                    var fmt = $filter('cpf')(value);
                    ctrl.$viewValue = fmt;
                    ctrl.$render();
                    
                    
                    if(value.length === 11){
                        ctrl.$setValidity('cpf', CpfService.validate(value));
                    } else if(value === ''){
                        ctrl.$setValidity('cpf', true);
                    } else {
                        ctrl.$setValidity('cpf', false);
                    }
                    
                    return value;
                });
                ctrl.$formatters.unshift(function(value) {
                    var fmt = $filter('cpf')(value);
                    return fmt;
                });
            }
        };
    }
    angular.module('glowingCatalogApp').directive('cpf', ['$filter', 'CpfService',cpf]);
}(angular));
