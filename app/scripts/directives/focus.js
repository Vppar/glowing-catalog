(function (angular) {
    'use strict';
    angular.module('tnt.catalog.directives.focus', []).directive('tntFocus', ['$log', function ($log) {
        return {
            /**
             * Overrides the method focus() for HTML elements
             * @param scope
             * @param element
             */
            link : function (scope, element) {
                if (element.is(':input, :checkbox, :radio, :button, a')) {
                    // FIXME Look for a way to avoid this setTimeout();
                    setTimeout(function () {
                        element.focus();
                    }, 0);
                } else {
                    $log.warn('Trying to focus a non-focusable item!');
                }
            }
        };
    }]);
}(angular));
