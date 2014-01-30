(function(angular) {
    'use strict';
    function minlength() {
        return {
            require : 'ngModel',
            restrict : 'A',
            link : function(scope, element, attrs, ctrl) {

                var config = {};

                attrs.$observe('minlength', function(val) {
                    config.minlength = val;
                });
                ctrl.$parsers.unshift(function(value) {
                    if (value && value.length >= config.minlength) {
                        ctrl.$setValidity('minlength', true);
                    } else {
                        ctrl.$setValidity('minlength', false);
                    }
                    return value;
                });
            }
        };
    }
    angular.module('glowingCatalogApp').directive('minlength', minlength);
}(angular));
