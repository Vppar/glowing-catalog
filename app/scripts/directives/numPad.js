(function(angular) {
    'use strict';
    angular.module('tnt.catalog.directive.numpad', []).directive('numPad', function() {
        return {
            template : '<div></div>',
            restrict : 'E',
            link : function postLink(scope, element, attrs) {
                element.text('this is the numPad directive');
            }
        };
    });
}(angular));
