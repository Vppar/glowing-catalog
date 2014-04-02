(function (angular) {
    'use strict';

    var templateUrl = 'views/spinner-button.html';

    angular.module('glowingCatalogApp').run(['$http', '$templateCache', function ($http, $templateCache) {
        $http.get(templateUrl, {
            cache: $templateCache
        });
    }]);

    angular.module('glowingCatalogApp').directive('spinnerButton', ['$parse',function ($parse) {
        return {
            restrict: 'E',
            templateUrl: templateUrl,
            link: function postLink(scope, element, attrs) {

                // The event trigger mechanism.
                var fireInTheHole = null;

                function reset() {

                    scope.spinnerButtonCtrl = true;
                    fireInTheHole = function() {
                        // Warn the use about not to use ngClick.
                        if (attrs.ngClick) {
                            $log.warn('A ngClick was used in conjunction with a spinnerPromise directive, the ngClick will be blocked.');
                        }

                        // Do nothing while the process is running.
                        fireInTheHole = angular.noop;
                        scope.spinnerButtonCtrl = false;

                        // Evaluate the text passed in tntPromiseClick
                        // against the scope to find the function
                        var callBackPromise = $parse(attrs.spinnerPromise)(scope);

                        if (!(callBackPromise && angular.isFunction(callBackPromise['finally']))) {
                            $log.error('The return of spinnerPromise must return a promise.');
                            return;
                        }

                        callBackPromise['finally'](function() {
                            reset();
                        });
                    };
                }

                reset();

                element.bind('click', function(event) {
                    // prevent bubbling
                    event.stopPropagation();
                    // prevent other listeners of this element to be fired
                    event.stopImmediatePropagation();
                    // trigger the event inside a digest cycle
                    scope.$apply(fireInTheHole());
                });
            }
        };
    }]);
}(angular));