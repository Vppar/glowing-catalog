(function(angular) {
    'use strict';

    angular.module('tnt.catalog.numpad.input', []).directive('tntInput', function(NumpadService) {
        return {
            restrict : 'A',
            scope : {
                value : '?=ngModel'
            },
            link : function postLink(scope, element, attrs) {

                if (value === undefined) {
                    value = '';
                }

                var input = {};
                input.keypress = function(key) {
                    if (key === 'backspace') {
                        // TODO remove char(s) from value. if empty call NumpadService.prev();
                    } else if (key === 'clear') {
                        value = '';
                    } else if (key === 'ok') {
                        NumpadService.next();
                    } else {
                        value += key;
                    }
                    
                    // TODO (leave this for the grown ups) do some formating here, or make it compliant with ngModel maybe?
                    
                    element.text(value);
                };

                NumpadService.register(input);

                element.bind('click', function() {
                    scope.$apply(input.openKeyboard());
                });
                
                scope.$on('$destroy', function() {
                    NumpadService.unregister(input);
                });
            }
        };
    });
})(angular);