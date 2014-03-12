(function (angular) {
    'use strict';
    angular.module('tnt.catalog.directives.equals', []).directive('tntEquals', ['$log', '$parse', function ($log, $parse) {
        return {
            require : '?ngModel',

            /**
             * Overrides the method focus() for HTML elements
             * @param scope
             * @param element
             */
            link : function (scope, element, attrs, ctrl) {
                if (!ctrl || attrs.tntEquals === '') {
                    $log.debug('No ctrl set in tnt-equals directive.');
                    return;
                }
                
                function checkValidity(value) {
                    if (value === $parse(attrs.tntEquals)(scope)) {
                        ctrl.$setValidity('equals', true);
                    } else {
                        ctrl.$setValidity('equals', false);
                    }

                    return value;
                }

                scope.$watch(attrs.tntEquals, function () {
                    checkValidity(ctrl.$viewValue);
                });

                ctrl.$parsers.unshift(checkValidity);
            }
        };
    }]);
}(angular));
