(function (angular) {
    'use strict';

    var templateUrl = 'components/tnt-numpad/tnt-numpad.html';

    angular.module('tnt.catalog.components.numpad', []).directive('tntNumpad', [
        function () {
            return {
                templateUrl : templateUrl,
                restrict : 'E',
                replace : true,
                link : function postLink (scope, element, attrs) {
                    scope.click = function ($event) {
                        var key = $event.target.alt;
                        if(key){
                            scope.$emit('tnt.events.virtualKeyboard.KeyPress', key);
                        }
                    };

                    scope.prevent = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    };
                }
            };
        }
    ]);
}(angular));