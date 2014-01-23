(function(angular) {
    'use strict';

    var kinput = angular.module('tnt.catalog.keyboard.input', [
        'tnt.catalog.keyboard.service'
    ]);

    kinput.directive('tntKbutton', function(KeyboardService, $log) {
        return {
            restrict : 'A',
            scope : {},
            link : function postLink(scope, element, attrs) {

                var input = {
                    id : attrs.id,
                    next : attrs.next,
                    prev : attrs.prev,
                };

                input.keypress = function(key) {
                };

                input.setActive = function(active) {
                    if (active) {
                        setTimeout(function() {
                            element.click();
                        }, 0);
                        KeyboardService.next();
                    }
                };

                KeyboardService.register(input);

                scope.$on('$destroy', function() {
                    KeyboardService.unregister(input);
                });
            }
        };
    });

    kinput.directive('tntInput', function(KeyboardService, $log, $document) {
        return {
            restrict : 'A',
            require : 'ngModel',
            scope : {
                ngModel : '='
            },
            link : function postLink(scope, element, attrs, ctrl) {

                element.prop('readonly', true);
                element.css('cursor', 'pointer');

                var input = {
                    id : attrs.id,
                    next : attrs.next,
                    prev : attrs.prev
                };

                input.keypress = function(key) {

                    var current = element.val();

                    if (key === 'backspace') {
                        if (current === '') {
                            KeyboardService.prev();
                        } else {
                            current = String(current).substring(0, (current.length - 1));
                        }
                    } else if (key === 'clear') {
                        current = '';
                    } else if (key === 'ok') {
                        if (attrs.datepickerPopup !== undefined) {
                            // close datepicker
                            setTimeout(function() {
                                $document.trigger('click');
                            }, 0);
                        }
                        KeyboardService.next();
                        return;
                    } else {
                        if (!attrs.maxlength || current.length < attrs.maxlength) {
                            current += key;
                            if(current.length == attrs.maxlength){
                                KeyboardService.next();
                            }
                        } else {
                            KeyboardService.next();
                            return;
                        }
                    }

                    element.val(current);
                    ctrl.$setViewValue(current);

                };

                function bindFocus() {
                    setTimeout(function() {
                        $log.debug('tnt-input selected');
                        input.setFocus();
                        scope.$apply();
                    }, 0);
                }

                function changeWatcher() {
                    var cb = function() {
                    };

                    if (attrs.datepickerPopup !== undefined) {
                        cb = scope.$watch('ngModel', function(val, old) {
                            if (val && val !== old && element.val().length === attrs.datepickerPopup.length) {
                                // KeyboardService.next();
                            }
                        });
                    }
                    return cb;
                }

                input.setActive = function(active) {

                    var watcher = function() {
                    };

                    if (active) {
                        element.addClass('focus');
                        element.unbind('focus', bindFocus);
                        setTimeout(function() {
                            element.focus();
                        }, 0);

                        watcher = changeWatcher();

                    } else {
                        watcher();
                        element.bind('focus', bindFocus);
                        element.removeClass('focus');
                    }
                };

                KeyboardService.register(input);

                element.bind('focus', bindFocus);

                scope.$on('$destroy', function() {
                    KeyboardService.unregister(input);
                });

                if (attrs.focus !== undefined) {
                    input.setFocus();
                }
            }
        };
    });
})(angular);