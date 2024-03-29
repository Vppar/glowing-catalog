(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').directive('recall', ['$log', function($log) {
        return {
            require : 'ngModel',
            link : function postLink(scope, element, attrs, ctrl) {
              
                var id = attrs.id ? attrs.id : attrs.name ? attrs.name : '?';
              
                element.bind('focus', function() {
                    scope.$apply(function() {
                        ctrl.storedValue = ctrl.$viewValue;
                        ctrl.$viewValue = '';
                        ctrl.$render();
                        ctrl.$pristine = true;
                    });
                    $log.debug('recall ' + id + ' remembers: ' + ctrl.storedValue);
                });
                
                element.bind('blur', function() {
                    scope.$apply(function() {
                        if (ctrl.$pristine) {
                            ctrl.$setViewValue(ctrl.storedValue);
                            ctrl.$render();
                            $log.debug('recall ' + id + ' recalls: ' + ctrl.storedValue);
                        } else {
                            $log.debug('recall ' + id + ' just forgot a bunch of stuff');
                        }
                    });
                });

            }
        };
    }]);
}(angular));