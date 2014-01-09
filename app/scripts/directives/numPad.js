(function(angular) {
    'use strict';

    var templateUrl = 'views/parts/catalog/num-pad.html';

    angular.module('tnt.catalog.directive.numpad.template', []).run(function($http, $templateCache) {
        $http.get(templateUrl, {
            cache : $templateCache
        });
    });

    angular.module('tnt.catalog.directive.numpad', [
        'tnt.catalog.keyboard.service'
    ]).directive('numPad', function(KeyboardService) {
        return {
            restrict : 'E',
            scope : {
                isActive : '=ngModel'
            },
            templateUrl : templateUrl,
            link : function postLink(scope, element, attrs) {

                var keyboard = {
                    isActive : scope.isActive
                };

                KeyboardService.setKeyboard(keyboard);
                scope.keypress = KeyboardService.keypress;

                element.find("img[alt='0']").bind('tap', function() {
                    scope.$apply('keypress(0)');
                });
                element.find("img[alt='00']").bind('tap', function() {
                    scope.$apply('keypress("00")');
                });
                element.find("img[alt='1']").bind('tap', function() {
                    scope.$apply('keypress(1)');
                });
                element.find("img[alt='2']").bind('tap', function() {
                    scope.$apply('keypress(2)');
                });
                element.find("img[alt='3']").bind('tap', function() {
                    scope.$apply('keypress(3)');
                });
                element.find("img[alt='4']").bind('tap', function() {
                    scope.$apply('keypress(4)');
                });
                element.find("img[alt='5']").bind('tap', function() {
                    scope.$apply('keypress(5)');
                });
                element.find("img[alt='6']").bind('tap', function() {
                    scope.$apply('keypress(6)');
                });
                element.find("img[alt='7']").bind('tap', function() {
                    scope.$apply('keypress(7)');
                });
                element.find("img[alt='8']").bind('tap', function() {
                    scope.$apply('keypress(8)');
                });
                element.find("img[alt='9']").bind('tap', function() {
                    scope.$apply('keypress(9)');
                });
                element.find("img[alt='backspace']").bind('tap', function() {
                    scope.$apply('keypress()');
                });
                element.find("img[alt='clear']").bind('tap', function() {
                    scope.$apply('clearMoney()');
                });
                element.find("img[alt='ok']").bind('tap', function() {
                    scope.$apply('btnOk()');
                });

                scope.pushMoneyDigit = function pushMoneyDigit(digit) {
                    digit = digit + '';
                    scope.amount += digit;
                    scope.amount = shiftPoint(scope.amount);
                };
                scope.removeMoneyDigit = function removeMoneyDigit() {
                    scope.amount = scope.amount.slice(0, -1);
                    if (scope.amount.length > 0) {
                        scope.amount = shiftPoint(scope.amount);
                    } else {
                        scope.amount = '0';
                    }
                };
                scope.clearMoney = function clearMoney() {
                    scope.amount = '0';
                };

                function shiftPoint(value) {
                    value = value.replace('.', '');
                    if (value.length == 1) {
                        value = '0.0' + value;
                    } else if (value.length == 2) {
                        value = '0.' + value;
                    } else {
                        value = value.substring(0, value.length - 2) + '.' + value.substring(value.length - 2);
                    }
                    return value;
                }
            }
        };
    });
}(angular));
