(function (angular, FastClick) {
    'use strict';
    angular.module('tnt.catalog.directives.fastClick', []).directive('fastClick', function () {
        return {
            link : function (scope, element) {
                FastClick.attach(element[0]);
            }
        };
    });
}(angular, FastClick));
