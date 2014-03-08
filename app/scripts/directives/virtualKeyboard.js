(function (angular) {
    'use strict';
    angular.module('tnt.catalog.directives.virtualKeyboard', []).directive(
        'tntVirtualKeyboard',
        function () {
            return {
                scope : {
                    okClick : '&'
                },
                link : function (scope, element) {
                    scope.$on('tnt.events.virtualKeyboard.KeyPress', function (event, key) {
                        // If this event has not yet been handled
                        if (!event.defaultPrevented && element.is(':focus')) {
                            if (key === 'del') {
                                element.val('');
                            } else if (key === 'backspace') {
                                element.val(element.val().slice(0, -1));
                            } else if (key === 'enter') {
                                if (scope.okClick) {
                                    scope.okClick();
                                }
                            } else {
                                element.val(element.val() + key);
                            }
                        }
                    });

                }
            };
        });
}(angular));
