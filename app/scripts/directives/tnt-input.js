(function (angular) {
    'use strict';

    var kinput = angular.module('tnt.catalog.keyboard.input', [
        'tnt.catalog.keyboard.service'
    ]);

    kinput.directive('tntKbutton', [
        'KeyboardService', function (KeyboardService) {
            return {
                restrict : 'A',
                scope : {},
                link : function postLink (scope, element, attrs) {

                    var input = {
                        id : attrs.id,
                        next : attrs.next,
                        prev : attrs.prev,
                    };

                    input.keypress = function () {
                    };

                    input.setActive = function (active) {
                        if (active) {
                            setTimeout(function () {
                                element.click();
                            }, 0);
                            KeyboardService.next();
                        }
                    };

                    KeyboardService.register(input);

                    scope.$on('$destroy', function () {
                        KeyboardService.unregister(input);
                    });
                }
            };
        }
    ]);

    kinput.directive('tntInput', [
        'KeyboardService',
        '$log',
        '$document',
        function (KeyboardService, $log, $document) {
            return {
                restrict : 'A',
                require : 'ngModel',
                scope : {
                    ngModel : '=',
                    okClick : '&',
                    pctClick : '&',
                    tntRelativeValue : '&'
                },
                link : function postLink (scope, element, attrs, ctrl) {

                    element.prop('readonly', true);
                    element.css('cursor', 'pointer');

                    var input = {
                        id : attrs.id,
                        next : attrs.next,
                        prev : attrs.prev
                    };

                    input.keypress = function (key) {

                        var current = element.val();

                        $log.debug('field contains ' + current + '. Keypress is ' + key);

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
                                setTimeout(function () {
                                    $document.trigger('click');
                                }, 0);
                            }
                            KeyboardService.next();
                            if (scope.okClick) {
                                scope.okClick();
                            }
                            return;
                        } else if (key === 'percent') {
                            // We'll need to get a model to use as a base for
                            // the
                            // calculating the percentage

                            var relatedVal = scope.tntRelativeValue && scope.tntRelativeValue();

                            if (relatedVal) {
                                if (typeof current === 'string') {
                                    // Clear up the value to make it be properly
                                    // parsed by parseFloat()
                                    current = current.replace('.', '');
                                    current = current.replace(',', '.');
                                }

                                var ratio = parseFloat(current) / 100;

                                var absoluteVal = null;
                                if (ratio > 100) {
                                    absoluteVal = 100 * relatedVal;
                                } else {
                                    // When we apply the value back to the element,
                                    // we must compensate for the decimal places
                                    // used by the currency directive, that's why we
                                    // multiply the value by 100 twice, instead of
                                    // only once, as we would normally do to round
                                    // the float.
                                    absoluteVal = Math.round(100 * 100 * relatedVal * ratio) / 100;
                                }

                                KeyboardService.next();

                                // Time 100 to compensate for the two decimal
                                // set by the
                                // currency directive
                                element.val(absoluteVal);

                                // Trigger the input event to make angular
                                // update the
                                // model's value.
                                element.trigger('input');

                                if (scope.okClick) {
                                    scope.okClick();
                                }
                            }

                            return;
                        } else {
                            if (!attrs.maxlength || current.length < attrs.maxlength) {
                                current += key;
                                // FIXME check this eqeqeq
                                if (current.length == attrs.maxlength) {
                                    setTimeout(function () {
                                        KeyboardService.next();
                                    }, 0);
                                }
                            } else {
                                setTimeout(function () {
                                    KeyboardService.next();
                                }, 0);
                                return;
                            }
                        }

                        element.val(current);
                        ctrl.$setViewValue(current);
                    };

                    function bindFocus () {
                        setTimeout(function () {
                            $log.debug('tnt-input selected');
                            input.setFocus();
                            scope.$apply();
                        }, 0);
                    }

                    function changeWatcher () {
                        var cb = function () {
                        };

                        if (attrs.datepickerPopup !== undefined) {
                            cb =
                                scope.$watch('ngModel', function (val, old) {
                                    if (val && val !== old &&
                                        element.val().length === attrs.datepickerPopup.length) {
                                        // KeyboardService.next();
                                    }
                                });
                        }
                        return cb;
                    }

                    input.setActive =
                        function (active) {

                            var watcher = function () {
                            };

                            if (active) {
                                element.unbind('focus', bindFocus);
                                if (!element.is(':focus')) {
                                    setTimeout(function () {
                                        element.focus();
                                    }, 0);
                                }
                                watcher = changeWatcher();

                            } else {
                                watcher();
                                if (element.is(':focus')) {
                                    element.trigger('blur');
                                }
                                element.bind('focus', bindFocus);

                                if (scope.tntRelativeValue) {
                                    var current = element.val();
                                    var discountLimit =
                                        scope.tntRelativeValue && scope.tntRelativeValue();
                                    ;

                                    current = current.replace('.', '');
                                    current = Number(current.replace(',', '.'));

                                    if (current > discountLimit) {
                                        element.val(100 * discountLimit);
                                        element.trigger('input');
                                    }
                                }
                            }
                        };

                    KeyboardService.register(input);

                    element.bind('focus', bindFocus);

                    scope.$on('$destroy', function () {
                        KeyboardService.unregister(input);
                    });

                    if (attrs.focus !== undefined) {
                        input.setFocus();
                    }
                }
            };
        }
    ]);
})(angular);
