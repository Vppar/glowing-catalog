(function(angular) {
    'use strict';

    angular.module('tnt.catalog.keyboard.input', [
        'tnt.catalog.keyboard.service'
    ]).directive('tntInput', function(KeyboardService, $log) {
        return {
            restrict : 'A',
            scope : {
                value : '=?ngModel',
                btnOk : '&'
            },
            link : function postLink(scope, element, attrs) {

                if (scope.value === undefined) {
                    scope.value = '';
                }
                var maxDigits = attrs.maxDigits;

                var input = {
                    id : attrs.id,
                    next : attrs.next,
                    prev : attrs.prev
                };

                input.keypress = function(key) {

                    if (key === 'backspace') {
                        if (scope.value === '') {
                            KeyboardService.prev();
                        } else {
                            scope.value = scope.value.substring(0, (scope.value.length - 1));
                        }
                    } else if (key === 'clear') {
                        scope.value = '';
                    } else if (key === 'ok') {
                        KeyboardService.next();
                    } else {
                        if (maxDigits) {
                            if (scope.value.length < maxDigits) {
                                scope.value += key;
                            }
                        } else {
                            scope.value += key;
                        }
                    }

                    element.text(scope.value);
                };

                input.setActive = function(active) {
                    if (active) {
                        element.addClass('editing');
                    } else {
                        element.removeClass('editing');
                    }
                };

                // TODO use proper formatter

                KeyboardService.register(input);

                element.bind('click', function() {
                    $log.debug('tnt-input selected');
                    scope.$apply(input.setFocus());
                });

                scope.$on('$destroy', function() {
                    KeyboardService.unregister(input);
                });
            }
        };
    });
})(angular);