(function (angular) {
    'use strict';
    angular.module('tnt.catalog.directives.virtualKeyboard', []).directive('tntVirtualKeyboard', [
        '$parse', function ($parse) {
            return {
                link : function (scope, element, attrs) {
                    scope.$on('tnt.events.virtualKeyboard.KeyPress', function (event, key) {
                        // If this event has not yet been handled
                        if (!event.defaultPrevented && element.is(':focus')) {
                            if($parse(attrs.tntKeypress)(scope, {$key : key}) !== false){
                                if (key === 'del') {
                                    element.val('');
                                } else if (key === 'backspace') {
                                    element.val(element.val().slice(0, -1));
                                } else if (key === 'enter') {
                                    // sit on it!
                                } else {
                                    element.val(element.val() + key);
                                }
                                element.trigger('input');
                            }
                        }
                    });

                }
            };
        }
    ]);
}(angular));
