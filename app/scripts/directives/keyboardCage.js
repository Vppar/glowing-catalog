(function (angular) {
    'use strict';
    angular.module('tnt.catalog.directives.keyboardCage', []).directive(
        'tntKeyboardCage',
        function () {
            return {
                link : function (scope) {
                    scope.$on('tnt.events.virtualKeyboard.KeyPress', function (event, key) {
                        // If this event has not yet been handled
                        if (!event.defaultPrevented) {
                            // stop propagation
                            event.stopPropagation();
                            // mark as handled
                            event.preventDefault();
                            // Broadcast the same event downwards
                            scope.$broadcast('tnt.events.virtualKeyboard.KeyPress', key);
                        }
                    });

                }
            };
        });
}(angular));
