(function(angular) {
    'use strict';
    angular.module('tnt.catalog.directives.promiseClick', []).directive('tntPromiseClick', [
        '$log', '$parse',
        /**
         * Directive to make a click event in a DOM element works only once
         * until a informed promise is resolved. When the promise is resolved
         * the click will be back in place.
         * 
         * @param {function} $log - Angular log function.
         * @param {function} $parse - Converts Angular expression into a
         *            function.
         */
        function($log, $parse) {
            return {
                restrict : 'A',
                link : function postLink(scope, element, attrs) {
                    // The event trigger mechanism.
                    var fireInTheHole = null;

                    function reset() {
                        fireInTheHole = function() {
                            // Warn the use about not to use ngClick.
                            if (attrs.ngClick) {
                                $log.warn('A ngClick was used in conjunction with a promiseClick directive, the ngClick will be blocked.');
                            }

                            // Do nothing while the process is running.
                            fireInTheHole = angular.noop;

                            // Evaluate the text passed in tntPromiseClick
                            // against the scope to find the function
                            var callBackPromise = $parse(attrs.tntPromiseClick)(scope);

                            if (!(callBackPromise && angular.isFunction(callBackPromise['finally']))) {
                                $log.error('The return of tntPromiseClick must return a promise.');
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
        }
    ]);
})(angular);
