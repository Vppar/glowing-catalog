(function(angular) {
    'use strict';

    angular.module('tnt.catalog.numpad.input', []).directive('tntInput', function(KeyboardService) {
        return {
            restrict : 'A',
            scope : {
                value : '=?ngModel'
            },
            link : function postLink(scope, element, attrs) {

                if (scope.value === undefined) {
                    scope.value = '';
                }

                var input = {
                    id : element.contents().context.id
                };

                input.keypress = function(key) {
                    if (key === 'backspace') {
                        if (scope.value === '') {
                            KeyboardService.prev();
                        }
                        scope.value = scope.value.substring(0, (scope.value.length - 1));
                    } else if (key === 'clear') {
                        scope.value = '';
                    } else if (key === 'ok') {
                        KeyboardService.next();
                    } else {
                        scope.value += key;
                    }

                    element.text(scope.value);
                };

                KeyboardService.register(input);

                element.bind('click', function() {
                    scope.$apply(input.setFocus());
                });

                scope.$on('$destroy', function() {
                    KeyboardService.unregister(input);
                });
            }
        };
    });
})(angular);