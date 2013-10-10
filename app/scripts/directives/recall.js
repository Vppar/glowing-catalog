(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').directive('recall', function() {
        return {
            require : 'ngModel',
            link : function postLink(scope, element, attrs, ctrl) {
                element.bind('blur', function() {
                    scope.$apply(function() {
                        if (ctrl.$pristine) {
                            ctrl.$setViewValue(ctrl.storedValue);
                            ctrl.$render();
                        }
                    });
                });

                element.bind('focus', function() {
                    scope.$apply(function() {
                        ctrl.storedValue = ctrl.$viewValue;
                        ctrl.$viewValue = '';
                        ctrl.$render();
                        ctrl.$pristine = true;
                    });
                });
            }
        };
    });
}(angular));