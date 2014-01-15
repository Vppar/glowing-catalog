(function(angular) {
    'use strict';

    angular.module('tnt.catalog.keyboard.input', [
        'tnt.catalog.keyboard.service'
    ]).directive('tntInput', function(KeyboardService, $log) {
        return {
            restrict : 'A',
            require : 'ngModel',
            scope : {},
            link : function postLink(scope, element, attrs, ctrl) {

                element.prop('readonly', true);
                element.css('cursor', 'pointer');

                var input = {
                    id : attrs.id,
                    next : attrs.next,
                    prev : attrs.prev
                };

                input.keypress = function(key) {

                    var current = ctrl.$viewValue;

                    if (key === 'backspace') {
                        if (scope.value === '') {
                            KeyboardService.prev();
                        } else {
                            current = current.substring(0, (current.length - 1));
                        }
                    } else if (key === 'clear') {
                        current = '';
                    } else if (key === 'ok') {
                        KeyboardService.next();
                    } else {
                        current += key;
                    }

                    element.val(current);
                    ctrl.$setViewValue(current);

                };

                input.setActive = function(active) {
                    if (active) {
                        element.addClass('editing');
                    } else {
                        element.removeClass('editing');
                    }
                };

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