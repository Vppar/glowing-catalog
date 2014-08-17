(function (angular) {
    'use strict';
    angular.module('tnt.catalog.directives.eventDeflect', []).directive('tntEventDeflect',
        function () {
            return {
                link : function (scope, element, attrs) {
                    scope.$parent.$on(attrs.tntEventDeflect, function (event, data) {
                        scope.$broadcast(attrs.tntEventDeflect, data);
                    });

                }
            };
        }
    );
}(angular));
