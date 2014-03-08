(function (angular) {
    'use strict';
    angular.module('tnt.catalog.directives.preventBlur', []).directive('tntPreventBlur', function () {
        return {
            /**
             * Overrides the method blur() for HTML elements
             * Created to counte the efffect of document.activeElement.blur() from FastClick
             * 
             * @param scope
             * @param element
             */
            link : function (scope, element) {
                var _blur = element[0].blur;
                element[0].blur = function(){};
            }
        };
    });
}(angular));
