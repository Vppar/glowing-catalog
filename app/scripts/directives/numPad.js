(function(angular) {
    'use strict';

    var templateUrl = 'views/parts/catalog/num-pad.html';

    angular.module('tnt.catalog.directive.numpad',[]).run(function($http, $templateCache) {
        $http.get(templateUrl, {
            cache : $templateCache
        });
    });

    angular.module('tnt.catalog.directive.numpad',[]).directive('numPad', function() {
        return {
            restrict : 'E',
            scope : {
                amount : '=ngModel',
                btnOk : '&'
            },
            templateUrl : templateUrl,
            link : function postLink(scope, element, attrs) {
                console.log(scope.done);
                scope.pushMoneyDigit = function pushMoneyDigit(digit) {
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
